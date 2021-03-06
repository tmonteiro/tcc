function Problema() {
	this.funcaoObjetivo = new FuncaoObjetivo();
	this.restricoes = new Array();
	this.restNaoNegatividade = null;
}

function FuncaoObjetivo() {
	this.tipo = new String();
	this.nome = new String();
	this.funcao = {
		coeficientes : new Array(),
		variaveis : new Array(),
		constante : null
	};
	this.maior = {
		coeficiente: new Number(),
		variavel: new String()
	};
}

function Restricao() {
	this.funcao = {
		coeficientes : new Array(),
		variaveis : new Array(),
		};
	this.ineq = new String;
	this.constante = new Number();
}

function Folga(){
	this.variavel = new Array();
	this.funcao = {
		coeficientes : new Array(),
		variaveis : new Array(),
		constante : null
		};
}

function Dicionario() {
	this.base = new Array();
	this.funcaoObjetivo = new FuncaoObjetivo();
	this.restricoesNn = new Array();
	this.solucao = new Array();
	this.maiorRestricao = {
					coeficiente: null,
					variavel: null
					};
	this.maxZ = null;
}

FuncaoObjetivo.prototype.setTipo = function(inString) {
	this.tipo = inString;
}

FuncaoObjetivo.prototype.setFuncaoObjetivo = function(inArray) {
	var aux;
	for (var i = 0; i < inArray.length; i++){
		this.funcao.variaveis[i] = /([a-zA-Z].*)/.exec(inArray[i])[1];
		aux = inArray[i].replace(/[a-zA-Z].*/, '');
		if (aux == "+"){
			aux = "1";
		}
		else if  (aux == "-"){
			aux = "-1";
		}
		this.funcao.coeficientes[i] = Number(aux);
	}
	this.nome = 'z';
}

FuncaoObjetivo.prototype.verificarSolucao = function() {
  var coef = this.funcao.coeficientes;
  var aux = new Array();
    
  for (i=0; i<coef.length; i++) {
	if (coef[i] <= 0) {
	  aux[i] = coef[i];
	} else {
	  this.maiorElemento();
	}
  }
    
  if (aux.length == coef.length){
	return true;
  } else {
	return false;
  }
}

FuncaoObjetivo.prototype.maiorElemento = function() {
	var temp = this.funcao.coeficientes;
	var maior = 0;
	for (i=0; i<temp.length; i++){
		var aux = temp[i];
		if (temp[i] > maior) {
			maior = temp[i];
		}
	}
	this.maior.coeficiente = maior;
	this.maior.variavel = this.funcao.variaveis[temp.indexOf(maior)];
}

FuncaoObjetivo.prototype.recalcular = function () {
  var subx = arguments[0].variavel;
  var subcons = arguments[0].constante;
  var subvars = arguments[0].variaveis;
  var subcoefs = arguments[0].coeficientes;
  var index = this.funcao.variaveis.indexOf(subx);
  var coef = this.funcao.coeficientes[index];

  if (index != -1) {

    //mathml da funcaoObjetivo sem a manipulacao
    mathmlRecalculo(this, 'inicial', arguments[1]);

    this.funcao.variaveis.splice(index, 1, subvars);
    this.funcao.coeficientes.splice(index + 1, 0, subcoefs);

    mathmlRecalculo(this, 'manip', subcons, arguments[1]);

    var tempArray = new Array();

    //MULTIPLICA PELO COEFICIENTE DA VARIAVEL QUE SAIU
    for (var i = 0; i < this.funcao.coeficientes[index + 1].length; i++) {
      tempArray[i] = coef * this.funcao.coeficientes[index + 1][i];
    }

    var newCons = subcons * coef;
    this.funcao.coeficientes.splice(index, 1);
    this.funcao.coeficientes.splice(index, 1, tempArray);

    tempArray = [];
    tempArray = this.funcao.variaveis[index].slice(0, this.funcao.variaveis[index].length);
    this.funcao.variaveis.splice(index, 1);
    tempArray = tempArray.concat(this.funcao.variaveis);
    this.funcao.variaveis = tempArray;

    tempArray = this.funcao.coeficientes[index].slice(0, this.funcao.coeficientes[index].length);
    this.funcao.coeficientes.splice(index, 1);
    tempArray = tempArray.concat(this.funcao.coeficientes);
    this.funcao.coeficientes = tempArray;

    mathmlRecalculo(this,'final', newCons);

    var tempCoef = [];
    var tempVars = [];
    var soma = 0;

    for (var i = 0; i < this.funcao.variaveis.length; i++) {
      var variavel = this.funcao.variaveis[i];
      var coeficiente = this.funcao.coeficientes[i];
      var tst = tempVars.indexOf(variavel);

      if (tst < 0) {
        var cont = 0;
        index = [];
        var valor = [];
        for (var j = 0; j < this.funcao.variaveis.length; j++) {
          if (variavel == this.funcao.variaveis[j]) {
            index[cont] = j;
            cont++;
          }
        }
        soma = 0;

        for (var k = 0; k < index.length; k++) {
          valor[k] = this.funcao.coeficientes[index[k]];
        }
        if (index.length > 1) {
          for (var k = 0; k < valor.length; k++) {
            soma = soma + valor[k];
          }
        } else {
          soma = valor[0];
        }
        tempCoef.push(soma);
        tempVars.push(variavel);
      }

    }

    newCons = newCons + this.funcao.constante;
	
	this.funcao.constante = newCons;
    this.funcao.coeficientes = tempCoef;
    this.funcao.variaveis = tempVars;

    this.bubblesort();
	
    mathmlRecalculo(this, 'inicial');
  }
}

FuncaoObjetivo.prototype.bubblesort = function () {
	var done = false;
    while (!done) {
        done = true;
        for (var i = 1; i<this.funcao.variaveis.length; i++) {
            if (parseInt(this.funcao.variaveis[i-1].substring(1, this.funcao.variaveis[i-1].length)) > parseInt(this.funcao.variaveis[i].substring(1, this.funcao.variaveis[i].length))) {
                done = false;
                [this.funcao.variaveis[i-1], this.funcao.variaveis[i]] = [this.funcao.variaveis[i], this.funcao.variaveis[i-1]];
				[this.funcao.coeficientes[i-1], this.funcao.coeficientes[i]] = [this.funcao.coeficientes[i], this.funcao.coeficientes[i-1]];
            }
        }
    }
}

/* --------------------------------------------------------- */
/*	METODOS DO OBJETO RESTRICAO
/* --------------------------------------------------------- */

Restricao.prototype.setRestricao = function (inArray) {
  var temp;
  for (var i = 0; i < inArray.length - 2; i++) {
    this.funcao.variaveis[i] = /([a-zA-Z].*)/.exec(inArray[i])[1];
    temp = inArray[i].replace(/[a-zA-Z].*/, '');
    if (temp == "+") {
      temp = "1";
    } else if (temp == "-") {
      temp = "-1";
    }
    this.funcao.coeficientes[i] = Number(temp);
  }
  this.ineq = inArray[inArray.length - 2];
  this.constante = Number(inArray[inArray.length - 1]);
}

/* --------------------------------------------------------- */
//  METODOS DO OBJETO PROBLEMA
/* --------------------------------------------------------- */

Problema.prototype.setFuncaoObjetivo = function () {
  this.funcaoObjetivo = arguments[0];
}

Problema.prototype.setRestricoes = function () {
  this.restricoes = arguments[0];
}

Problema.prototype.setRestricoesNn = function () {
  this.restNaoNegatividade = this.funcaoObjetivo.funcao.variaveis;
}

Problema.prototype.getRestricoesNn = function () {
  this.setRestricoesNn();
  return this.restNaoNegatividade;
}

/* --------------------------------------------------------- */
//	Metodos do objeto Folga
/* --------------------------------------------------------- */

Folga.prototype.setFolga = function () {
  var rest = arguments[0];

  this.variavel = "x" + Number(arguments[1]);
  for (var j = 0; j < rest.funcao.variaveis.length; j++) {
    this.funcao.coeficientes[j] = Number((rest.funcao.coeficientes[j]) * (-1));
    this.funcao.variaveis[j] = rest.funcao.variaveis[j]
  }
  this.funcao.constante = rest.constante;
}

Folga.prototype.recalcular = function () {

  //se foi passado a funcao principal da variavel que sera substituida
  if (arguments[0] instanceof Object) {
    var subx = arguments[0].variavel;
    var subcons = arguments[0].constante;
    var subvars = arguments[0].variaveis;
    var subcoefs = arguments[0].coeficientes;
    var index = this.funcao.variaveis.indexOf(subx);
    var coef = this.funcao.coeficientes[index];

    if (index != -1) {

      //mathml da equacao inicial 
      mathmlRecalculo(this, 'inicial', arguments[1]);

      this.funcao.variaveis.splice(index, 1, subvars);
      this.funcao.coeficientes.splice(index + 1, 0, subcoefs);

      mathmlRecalculo(this, 'manip', subcons);

      //MULTIPLICA PELO COEFICIENTE DA VARIAVEL QUE SAIU da base
      var tempArray = new Array();
      for (var i = 0; i < this.funcao.coeficientes[index + 1].length; i++) {
        tempArray[i] = coef * this.funcao.coeficientes[index + 1][i];
      }

      var newCons = subcons * coef;
      this.funcao.coeficientes.splice(index, 1);
      this.funcao.coeficientes.splice(index, 1, tempArray);

      tempArray = [];
      tempArray = this.funcao.variaveis[index].slice(0, this.funcao.variaveis[index].length);
      this.funcao.variaveis.splice(index, 1);
      tempArray = tempArray.concat(this.funcao.variaveis);
      this.funcao.variaveis = tempArray;

      tempArray = this.funcao.coeficientes[index].slice(0, this.funcao.coeficientes[index].length);
      this.funcao.coeficientes.splice(index, 1);
      tempArray = tempArray.concat(this.funcao.coeficientes);
      this.funcao.coeficientes = tempArray;

      mathmlRecalculo(this, 'final', newCons);

      var tempCoef = [];
      var tempVars = [];
      var soma = 0;

      /* Manipulacao algebrica */
      for (var i = 0; i < this.funcao.variaveis.length; i++) {
        var variavel = this.funcao.variaveis[i];
        var coeficiente = this.funcao.coeficientes[i];
        var tst = tempVars.indexOf(variavel);

        if (tst < 0) {
          var cont = 0;
          index = [];
          var valor = [];
          for (var j = 0; j < this.funcao.variaveis.length; j++) {
            if (variavel == this.funcao.variaveis[j]) {
              index[cont] = j;
              cont++;
            }
          }
          soma = 0;

          for (var k = 0; k < index.length; k++) {
            valor[k] = this.funcao.coeficientes[index[k]];
          }
          if (index.length > 1) {
            for (var k = 0; k < valor.length; k++) {
              soma = soma + valor[k];
            }
          } else {
            soma = valor[0];
          }
          tempCoef.push(soma);
          tempVars.push(variavel);
        }

      }

      newCons = newCons + this.funcao.constante;  
      this.funcao.constante = newCons;
      this.funcao.coeficientes = tempCoef;
      this.funcao.variaveis = tempVars;
	  
	  this.bubblesort(); 
	  
      mathmlRecalculo(this, 'final');
    }
  }
  //se foi passado apenas as variaveis que vão entrar e sair da base - RECALCULO DA PRINCIPAL
  else {
    var iteracao = arguments[2];
    mathmlRecalculo(this, 'inicial', iteracao);

    var sai = arguments[0];
    var entra = arguments[1];
    var aux = [];
    var dec = false;

    if (sai != this.variavel) {
      return alert("Erro.");
    }

    this.variavel = entra;

    var aux = new Array();
    var sai = arguments[0];
    var entra = arguments[1]

    this.funcao.variaveis.push(sai);
    this.funcao.coeficientes.push(-1);

    aux[0] = this.funcao.coeficientes.slice(this.funcao.variaveis.indexOf(entra), this.funcao.variaveis.indexOf(entra) + 1);
    this.funcao.coeficientes.splice(this.funcao.variaveis.indexOf(entra), 1);
    aux[1] = this.funcao.variaveis.slice(this.funcao.variaveis.indexOf(entra), this.funcao.variaveis.indexOf(entra) + 1);
    this.funcao.variaveis.splice(this.funcao.variaveis.indexOf(entra), 1);

    aux[0] = aux[0] * (-1);
	
	this.bubblesort();

    var fim = mathmlRecalculo(this, aux[0], iteracao); //MONTAR O MATHML PASSANDO A FUNCAO E O COEFICIENTE DA VARIAVEL QUE ENTROU NA BASE

    var lhs = aux[0];
    var rhs = this.funcao.coeficientes;

    for (var i = 0; i < rhs.length; i++) {
      rhs[i] = rhs[i] / lhs;
    }
    this.funcao.coeficientes = new Array();
    this.funcao.coeficientes = rhs;
    this.funcao.constante = this.funcao.constante / lhs;
	
	this.bubblesort();
	
    if (fim == false) {
      mathmlRecalculo(this, 'final', 'style');
    }

  }

}

Folga.prototype.bubblesort = function () {
	var done = false;
    while (!done) {
        done = true;
        for (var i = 1; i<this.funcao.variaveis.length; i++) {
            if (parseInt(this.funcao.variaveis[i-1].substring(1, this.funcao.variaveis[i-1].length)) > parseInt(this.funcao.variaveis[i].substring(1, this.funcao.variaveis[i].length))) {
                done = false;
                [this.funcao.variaveis[i-1], this.funcao.variaveis[i]] = [this.funcao.variaveis[i], this.funcao.variaveis[i-1]];
				[this.funcao.coeficientes[i-1], this.funcao.coeficientes[i]] = [this.funcao.coeficientes[i], this.funcao.coeficientes[i-1]];
            }
        }
    }
}

Folga.prototype.forcaRestritiva = function () {
  var inVar = arguments[0]; //VARIAVEL QUE VAI ENTRAR NA BASE
  var temp = this.funcao.variaveis.indexOf(inVar.variavel);
  var sinal = "ge";
  var lhs = arguments[1];
  var cons = this.funcao.constante;
  var rhs = this.funcao.coeficientes[temp];
  var iteracao = arguments[2];
  var aux = [];
  var y = 0;

  if (temp != -1) {
    y++;
    aux[y] = {
      tipo: 'inicial',
      iteracao: iteracao,
      lhs: lhs,
      cons: cons,
      rhs: rhs,
      inVar: inVar.variavel
    };

    lhs = rhs;
    rhs = cons * (-1);

    y++;
    aux[y] = {
      tipo: 'second',
      lhs: lhs,
      inVar: inVar.variavel,
      rhs: rhs,
      sinal: sinal
    };

    if (lhs < 0) {
      lhs = lhs * (-1);
      rhs = rhs * (-1);
      sinal = "le";
      y++;
      aux[y] = {
        tipo: 'second',
        lhs: lhs,
        inVar: inVar.variavel,
        rhs: rhs,
        sinal: sinal
      };
    }

    if (lhs != 1) {
      y++;
      aux[y] = {
        tipo: 'third',
        lhs: lhs,
        inVar: inVar.variavel,
        rhs: rhs,
        sinal: sinal
      };
    }

    if (rhs % lhs != 0 || lhs == 1) {
      var result = rhs / lhs;
    } else {
      var result = rhs / lhs;
      y++;
      aux[y] = {
        tipo: 'fourth',
        inVar: inVar.variavel,
        result: result,
        sinal: sinal
      };
    }
    aux[0] = result;
  } else {
    aux = -1; // essa funcao não possui a variavel que entrará na base
  }
  return (aux);

}

/* --------------------------------------------------------- */
//	METODOS DO OBJETO DICIONARIO
/* --------------------------------------------------------- */

Dicionario.prototype.setBase = function () {
  var rest = arguments[0];
  problema.funcaoObjetivo.bubblesort();
  
  var indVar = problema.funcaoObjetivo.funcao.variaveis[problema.funcaoObjetivo.funcao.variaveis.length-1]
  
  for (var i = 1; i <= rest.length; i++) {
    this.base[i - 1] = new Folga();
    this.base[i - 1].setFolga(rest[i - 1], parseInt(indVar.substring(1, indVar.length)) + i);
  }
  
}

Dicionario.prototype.setFuncaoObjetivo = function () {
  this.funcaoObjetivo = arguments[0];
}

Dicionario.prototype.setRestricoesNn = function () {
  var vFo = this.funcaoObjetivo.funcao.variaveis;
  var vVf = [];

  for (var i = 0; i < this.base.length; i++) {
    vVf[i] = this.base[i].variavel;
  }

  var temp = this.restricoesNn.concat(vFo, vVf);
  this.restricoesNn = temp;
}

Dicionario.prototype.setSolucao = function () {

  for (var i = 0; i < this.base.length; i++) {
    var tempVar = this.base[i].variavel;
    var tempCons = this.base[i].funcao.constante;
    var tempIndex = this.restricoesNn.indexOf(tempVar);
    this.solucao[tempIndex] = tempCons;
  }
  for (var i = 0; i < this.funcaoObjetivo.funcao.variaveis.length; i++) {
    tempVar = this.funcaoObjetivo.funcao.variaveis[i];
    tempIndex = this.restricoesNn.indexOf(tempVar);
    this.solucao[tempIndex] = 0;
  }
}

Dicionario.prototype.getSolucao = function () {
  this.setSolucao();
  return this.solucao;
}

Dicionario.prototype.analise_ff = function () {
  var folga = this.base;
  var fo = this.funcaoObjetivo;
  var entra = fo.maior;
  var temp = [];
  var temp2 = null;
  var aux;
  var maiorRestricao = 999;
  var iteracao = arguments[0];

  //CALCULA A FORCA RESTRITIVA DE CADA EQUACAO
  for (var i = 0; i < folga.length; i++) {
    temp[i] = folga[i].forcaRestritiva(entra, folga[i].variavel, iteracao);

    if (temp[i][0] > 0 && temp[i][0] < maiorRestricao && temp[i] != -1) {
      maiorRestricao = temp[i][0];
      temp2 = folga[i].variavel;
      aux = i;
    }

  }
  temp[aux][0] = 'maior_restricao';
  this.maiorRestricao.variavel = temp2;
  mathml_afr(temp);
}

Dicionario.prototype.recalculoEquacoes = function () {
  var iteracao = arguments[0];
  var base = new Array();
  var entra = this.funcaoObjetivo.maior.variavel;
  var sai = this.maiorRestricao.variavel;

  for (var i = 0; i < this.base.length; i++) {
    base[i] = this.base[i].variavel;
    if (base[i] == sai) {
      var aux = i;
    }
  }

  //recalculo da principal
  this.base[aux].recalcular(sai, entra, iteracao);

  var funcao = {
    variavel: this.base[aux].variavel,
    constante: this.base[aux].funcao.constante,
    variaveis: this.base[aux].funcao.variaveis,
    coeficientes: this.base[aux].funcao.coeficientes
  };

  //recalculo das demais
  for (var i = 0; i < this.base.length; i++) {
    if (i != aux) {
      this.base[i].recalcular(funcao, iteracao);
    }
  }

  //recalculo da funcao objetivo
  this.funcaoObjetivo.recalcular(funcao, iteracao);
}

Dicionario.prototype.setMaxZ = function () {
  var max = this.funcaoObjetivo.funcao.constante;
  if (max == null) {
    this.maxZ = 0;
  } else {
    this.maxZ = max;
  }
}