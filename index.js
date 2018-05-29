var indexer = (function () {
  var wordvecsMessageHandler = {};
  var wordvecsLargeMessageHandler = {};
  var datasetMessageHandler = {};
  var numTokens = 0;
  var startTime;

  var word2vec;
  var word2vec_large;
  var dataset;
  var cur_dim;
  var weightsLoaded = 0;

  function round_and_fix(num) {
    var decimals = 4;
    var t = Math.pow(10, decimals);
    var res = (Math.round((num * t) + (decimals>0?1:0)*(Math.sign(num) * (10 / Math.pow(100, decimals)))) / t).toFixed(decimals);
    return parseFloat(res);
  }

  function get_dataset(i) {
    if (i != 0 && i % 100 == 0) {
      datasetMessageHandler.update(startTime, new Date().getTime(), i);
    }

    if (i == dataset.length) {
      console.log("Finished loading dataset.");
      return;
    }

    var transaction = db.transaction(["dataset"], "readwrite");
    var store = transaction.objectStore("dataset");
    var request = store.add(dataset[i], i);

    request.onerror = function (e) {
      // Dispatch to error message handler
      datasetMessageHandler.error(e);
    }

    request.onsuccess = function (e) {
      get_dataset(i + 1);
    }
  }

  function index_wordvec(i) {
    if (i != 0 && i % 100 == 0) {
      wordvecsMessageHandler.update(startTime, new Date().getTime(), i);
    }

    if (i == word2vec.length) {
      console.log("Finished loading wordvecs.");
      return;
    }

    var transaction = db.transaction(["wordvecs"], "readwrite");
    var store = transaction.objectStore("wordvecs");
    var request = store.add(word2vec[i]["word2vec"], word2vec[i]["word"]);

    request.onerror = function (e) {
      // Dispatch to error message handler
      wordvecsMessageHandler.error(e);
    }

    request.onsuccess = function (e) {
      index_wordvec(i + 1);
    }
  }

  function index_wordvec_large(i) {
    if (i != 0 && i % 100 == 0) {
      wordvecsLargeMessageHandler.update(startTime, new Date().getTime(), i);
    }

    if (i == word2vec_large.length) {
      console.log("Finished loading wordvecs_large.");
      return;
    }

    var transaction = db.transaction(["wordvecslarge"], "readwrite");
    var store = transaction.objectStore("wordvecslarge");
    var request = store.add(word2vec_large[i]["word2vec"], word2vec_large[i]["word"]);

    request.onerror = function (e) {
      // Dispatch to error message handler
      wordvecsLargeMessageHandler.error(e);
    }

    request.onsuccess = function (e) {
      index_wordvec_large(i + 1);
    }
  }

  return {
    setWordvecsMessageHandler: function(h) {
      wordvecsMessageHandler = h;
    },

    setWordvecsLargeMessageHandler: function(h) {
      wordvecsLargeMessageHandler = h;
    },

    setDatasetMessageHandler: function(h) {
      datasetMessageHandler = h;
    },

    index: function (w) {
      startTime = new Date().getTime();
      word2vec = w;
      index_wordvec(0);
    },

    index_large: function (w) {
      startTime = new Date().getTime();
      word2vec_large = w;
      index_wordvec_large(0);
    },

    setWeights: function (weights, dim, cb) {
      var db_name = "weights_" + dim;
      var transaction = db.transaction([db_name], "readwrite");
      var store = transaction.objectStore(db_name);
      weights.forEach((w, i) => {
        var request = store.add(w, i);
        request.onsuccess = e => {
          weightsLoaded++;
          if (weightsLoaded === 612) {
            cb();
          }
        };
      });
    },

    setBias: function (biases, dim, cb) {
      var db_name = "bias_" + dim;
      var transaction = db.transaction([db_name], "readwrite");
      var store = transaction.objectStore(db_name);
      biases.forEach((b, i) => {
        var request = store.add(b[0], i);
        request.onsuccess = e => {
          weightsLoaded++;
          if (weightsLoaded === 612) {
            cb();
          }
        };
      });
    },

    getDataset: function (w) {
      startTime = new Date().getTime();
      dataset = w;
      get_dataset(0);
    },
  };

})();
