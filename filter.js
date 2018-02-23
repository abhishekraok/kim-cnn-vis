
// used for node.js
// var nj = require('numjs');

const VECTOR_LENGTH = 300;

var filters = [[[0.01, 0.02],[0.03, 0.04],[0.05, 0.06]],
                [[-0.15,0.16],[0.2, -0.21],[-0.25,0.26],[0.3, -0.31]],
                [[0.23,0.24],[0.25, -0.2],[0.33,0.34],[0.15, -0.1],[0.43,0.44]]];

// build an input matrix for CNN
function build_input(results) {
    // range from [0.0, 1.0).

    var ret = results.map(function (result) {
        if (result[1].length <= 0) { // the word is not a top10k one
            // narraw random values down into range (-.25, .25]
            rmatrix = [];
            for (i = 0; i < VECTOR_LENGTH; i++) {
                rmatrix.push((Math.random()-0.5)/2);
            }
            return rmatrix;
        }

        return result[1];
    });

    return ret;
}

function cconv(input, weight, dim) {
  var sum = [];
  dim += 3;
  for (var r = 0; r < input.length-dim+1; r++) {
    sum[r] = [];
    sum[r][0] = 0;
    for (var i = 0; i < 300; i++) {
      sum[r][0] += input[r+0][i] * weight[0][i];
      sum[r][0] += input[r+1][i] * weight[1][i];
      sum[r][0] += input[r+2][i] * weight[2][i];
    }
    if (dim == 3) {
      sum[r][0] += 0.01;
    } else if (dim == 5) {
      sum[r][0] += -0.17;
    }
  }
  return sum;
}

// change this, need to use a different filter to convolve on each 3*300
function conv(input, weights) {
  var result = [];
  for (var i = 0; i < weights.length; i++) {  // 3
    result[i] = cconv(input, weights[i], i);
  }
  console.log(result)
  return result;
    //return weights.map(weight => nj.convolve(input, weight).tolist());
    // nj.add(nj.dot(w,z),b)
}

function argmax(input) {
    if (input.length <= 0 || input[0].length <= 0) {
        return -1;
    }
    var ans = [0, 0];
    var max = input[0][0];
    for (var i = 0; i<input.length; i++) {
        for (var j = 0; j<input[0].length; j++) {
            if (input[i][j] > max) {
                max = input[i][j];
                ans = [i, j];
            }
        }
    }
    return ans;
}

// input is an array of nj.array; return a nj.array of max polling after tanh
function max_polling(input) {
    return [input.map(a => argmax(nj.tanh(a).tolist())),
            input.map(a => [nj.tanh(a).max()])];
}

// y = w z + b;
function fully_connected(z) {
    return nj.softmax(z).tolist();
}

function display_conv(results, query, weights) {
    if (query.length < 5) {
        clean_up();
        return;
    }

    var input = build_input(results);
    var conv_res = conv(input, weights);
    console.log(conv_res)
    conv_res = [conv_res[0], conv_res[2]];  // 5

    var args, polling_res;
    [args, polling_res] = max_polling(conv_res);
    var output = fully_connected(polling_res);
    show_gradient_indicator();
    show_network(query, input, weights, conv_res, args, polling_res, output);
    return output;
}
