window.onload = function () {

  $('#enviar').on('click', function () {
    var ppl = $("textarea").val();
    if (ppl == '') {
      alert("Insira um PPL válido.");
    } else {
      $('.formulario').hide();
      $('#inicial #info').hide();
      $('#inicial').append('<div class="problema"><h4>PPL</h4></div>');
      $('#inicial').append('<div class="dicionario"><h4>Dicionário Inicial</h4></div>');
      $('#inicial .footer').remove();
      resolver(ppl);
      $('#inicial').append('<footer class="footer"></footer>');
    }
  });

  $('#exemplo').on('click', function () {
    $('#input').val('max z = 5x1 + 5x2 + 3x3\nsujeito a\nx1 + 3x2 + x3 <= 3\n-x1 + 3x3 <= 2\n2x1- x2 + 2x3 <= 4\n2x1 + 3x2 - x3 <= 2');
  });

  $('#limpar').on('click', function () {
    $('#input').val('');
  });

}

function resolver(ppl) {

  var string = tratar_string(ppl),
    arrayPPL,
    restricoes,
    iteracao = 0,
    solucao_otima;

  arrayPPL = extrair_array_elementos(string, unescape("%0D"));
  funcaoObjetivo = extrair_funcao_objetivo(arrayPPL);
  restricoes = extrair_restricoes(arrayPPL);

  problema = new Problema();
  problema.setFuncaoObjetivo(funcaoObjetivo);
  problema.setRestricoes(restricoes);
  mathml_ppl(problema);

  dicionario = new Dicionario();
  dicionario.setBase(problema.restricoes);
  dicionario.setFuncaoObjetivo(problema.funcaoObjetivo);
  dicionario.setRestricoesNn();
  dicionario.setSolucao();
  dicionario.setMaxZ();
  mathml_dicionario(dicionario, iteracao);

  solucao_otima = dicionario.funcaoObjetivo.verificarSolucao();

  while (solucao_otima != true) {
    iteracao++;
    $('.wrap').append('<div id="it' + iteracao + '" class="main" hidden></div>');
    $('ul.tabs').append('<li><a href="#it' + iteracao + '"> ' + iteracao + 'ª Iteração</a></li>');

    $('#it' + iteracao + '').append('<section class="analise_fr"><h4>Forças Restritivas ' + iteracao + 'ª Iteração</h4></section>');
    dicionario.analise_ff(iteracao);

    $('#it' + iteracao + '').append('<section class="recalculo"><h4>Recálculo das equações da ' + iteracao + 'ª Iteração</h4></section>');
    dicionario.recalculoEquacoes(iteracao);
    dicionario.setSolucao();
    dicionario.setMaxZ();

    $('#it' + iteracao + '').append('<section class="dicionario"><h4>Dicionário ' + iteracao + 'ª Iteração</h4></section>');
    mathml_dicionario(dicionario, iteracao);

    solucao_otima = dicionario.funcaoObjetivo.verificarSolucao();

    $('#it' + iteracao + '').append('<footer class="footer"></footer>');
  }
}

function tratar_string(string) {

  //Retirar espaços em branco da String
  string = retira_espacos(string);

  var cr = unescape("%0D");
  var lf = unescape("%0A");
  // Retira quebra de linha
  string = replaceSubstring(string, lf, cr);

  string = string.toLowerCase();

  //--- Substitui os <= e >= //
  var gteSymbol = unescape("%B3");
  var lteSymbol = unescape("%B2");
  var lte = unescape("%u2264");
  var gte = unescape("%u2265");
  string = replaceSubstring(string, "<=", lteSymbol);
  string = replaceSubstring(string, ">=", gteSymbol);
  string = replaceSubstring(string, lte, lteSymbol);
  string = replaceSubstring(string, gte, gteSymbol);
  string = replaceSubstring(string, "oa", "oa" + cr);
  string = replaceSubstring(string, ",", cr);
  string = replaceSubstring(string, cr + "sujeito", "sujeito");

  var doublecr = true;

  while (doublecr) {
    if (checkString(string, cr + cr, false) == -1) doublecr = false;
    else string = replaceSubstring(string, cr + cr, cr);

  }
  return (string);
}

function retira_espacos(inString) {
  var outString = "";
  for (var i = 0; i < inString.length; i++) {
    var tempChar = inString.substring(i, i + 1);
    if (tempChar != " ")
      outString = outString + tempChar;
  }
  return (outString);
}

function stripChar(inString, symbol) {
  outString = "";
  for (i = 0; i < inString.length; i++) {
    tempChar = inString.substring(i, i + 1);
    if (tempChar != symbol)
      outString = outString + tempChar;
  }
  return (outString);
}

function replaceSubstring(inString, oldSubstring, newSubstring) {
  var outString = "";
  var subLength = oldSubstring.length;
  for (i = 0; i < inString.length; i++) {
    var tempStr = inString.substring(i, i + subLength);
    var tempChar = inString.substring(i, i + 1);
    if (tempStr != oldSubstring) {
      outString = outString + tempChar;
    } else {
      outString = outString + newSubstring;
      i += subLength - 1;
    }
  }
  return (outString);
}

function isNumber(inString) {
  var result = true;
  var length = inString.length;
  if (length == 0) return (false);
  var x = ""
  var y = "1234567890-+*. /"
  var yLength = y.length;
  for (var i = 0; i <= length; i++) {

    x = inString.charAt(i);
    result = false;
    for (var j = 0; j <= yLength; j++) {
      if (x == y.charAt(j)) {
        result = true;
        break
      }
    }

    if (result == false) return (false);
  }
  return (result);
}

function extrair_array_elementos(inString, sep) {
  var numSep = 0;
  var local = new Array;
  local[0] = -1;
  var length = inString.length;

  //Array 'local' com a posição dos separadores na string
  for (var i = 0; i < length; i++) {
    if (inString.charAt(i) == sep) {
      numSep++;
      local[numSep] = i;
    }
  }

  var outArray = new Array();

  for (var i = 1; i <= numSep; i++) {
    outArray[i - 1] = inString.substring(local[i - 1] + 1, local[i]);
  }
  outArray[numSep] = inString.substring(local[numSep] + 1, length);

  if (outArray[outArray.length - 1] == '') {
    outArray.pop();
  }

  return (outArray);
}

function extrair_funcao_objetivo(tempArray) {
  var funcao_objetivo = new FuncaoObjetivo();

  //RETIRAR AS PALAVRAS SUJEITO A
  var linha1 = tempArray[0];
  var check = checkString(linha1, "s", true);
  if (check > 0) linha1 = linha1.substring(0, check);

  //RETIRAR A FUNCAO OBJETIVO
  check = checkString(linha1, "=", false);

  if (check <= 0) {
    check = checkString(linha1, "max", false);
    if (check >= 0) {
      var tipo = "max"
      linha1 = linha1.substring(check + 3, linha1.lenght);
    }
  } else {
    var tipo = linha1.substring(check - 1, 0);
    linha1 = linha1.substring(check + 1, linha1.lenght);
  }

  var funcaoObjTemp = parseLinearExpr(linha1);

  funcao_objetivo.setTipo(tipo);
  funcao_objetivo.setFuncaoObjetivo(funcaoObjTemp);

  return (funcao_objetivo);
}

function extrair_restricoes(tempArray) {
  var lteSymbol = unescape("%B2");
  var ineq = "lte";
  var restricoes = new Array;

  for (var i = 1; i <= tempArray.length - 1; i++) {

    var restr = extrair_array_elementos(tempArray[i], lteSymbol);
    var restricao = parseLinearExpr(restr[0]);
    var varlen = restricao.length;
    restricao[varlen] = ineq;
    restricao[varlen + 1] = restr[1];

    restricoes[i - 1] = new Restricao();
    restricoes[i - 1].setRestricao(restricao)
  }
  return (restricoes);
}

function parseLinearExpr(inString) {
  var stringlen = inString.length;

  if (!isNumber(inString.charAt(0))) {
    inString = "1" + inString;
  }

  if (inString.charAt(0) != "-") inString = "+" + inString;

  inString = replaceSubstring(inString, "+", "_+");
  inString = replaceSubstring(inString, "-", "_-");

  var ch = "_";
  var arrayElementos = extrair_array_elementos(inString, ch);

  var outArray = new Array();

  for (var i = 1; i <= arrayElementos.length - 1; i++) {
    outArray[i - 1] = stripChar(arrayElementos[i], "_");
  }

  return (outArray);
}

function checkString(inString, subString, backtrack) {
  // verifica se a string possui uma determinada subString
  // se backtrack = false, retorna -1, substring não encontrada
  // se backtrack = true, retorna -1 se não encontrada, e a posição caso encontrada
  var found = -1;
  var length = inString.length;
  var symbLength = subString.length;

  for (var i = length - symbLength; i > -1; i--) {
    var tempChar = inString.substring(i, i + symbLength);
    if (tempChar == subString) {
      found = i;
      if (backtrack) i = -1
    }
  }
  return (found);
}

/* ====================================================== */
/* ==== Tranformar numero decimal em Fracao ============= */
/* ====================================================== */
function toFrac(x) {

  var theFrac = new Array();
  theFrac[1] = 0;
  theFrac[2] = 0;

  var p1 = 1;
  var p2 = 0;
  var q1 = 0;
  var q2 = 1;

  var u = 0;
  var t = 0;

  var flag = true;
  var negflag = false;

  while (flag) {

    if (x < 0) {
      x = -x;
      negflag = true;
      p1 = -p1;
    }

    var intPart = Math.floor(x);
    var decimalPart = roundSigDig((x - intPart), 15);

    x = decimalPart;

    t = intPart * p1 + p2;
    u = intPart * q1 + q2;

    if ((Math.abs(t) > 10000000000) || (u > 1000)) {
      n = p1;
      d = q1;
      break;
    }

    p = t;
    q = u;

    if (x == 0) {
      n = p;
      d = q;
      break;
    }

    p2 = p1;
    p1 = p;
    q2 = q1;
    q1 = q;
    x = 1 / x;

  }

  theFrac[1] = n;
  theFrac[2] = d;

  if (theFrac[2] == 1) {
    return (theFrac[1].toString());
  } else {
    return (theFrac[1] + "/" + theFrac[2]);
  }

}

function shiftRight(theNumber, k) { //PASSA O NUMERO EX.: 4.5

  if (k == 0) {
    return (theNumber)
  } else {
    var k2 = 1;
    var num = k;

    if (num < 0) {
      num = -num;
    }

    for (var i = 1; i <= num; i++) {
      k2 = k2 * 10
    }
  }

  if (k > 0) {
    return (k2 * theNumber)
  } else {
    return (theNumber / k2)
  }
}

function roundSigDig(theNumber, numDigits) {

  numDigits = numDigits - 1

  with(Math) {

    if (theNumber == 0) { // SE O NUMERO FOR ZERO CAI FORA
      return (0);
    } else if (abs(theNumber) < 0.000000000001) { //SE O VALOR ABSOLUTO DO NUMERO FOR MENOS QUE 0.000000000001 SAI DA FUNCAO
      return (0);
    } else {

      var k = floor(log(abs(theNumber)) / log(10)) - numDigits
      var k2 = shiftRight(round(shiftRight(abs(theNumber), -k)), k) //chama 

      if (theNumber > 0) {
        return (k2);
      } else {
        return (-k2);
      }
    } // end else

  }
}