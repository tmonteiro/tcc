/* --------------------------------------------------------- */
//	OBJETO FUNCAO OBJETIVO
/* --------------------------------------------------------- */
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

FuncaoObjetivo.prototype.setTipo = function(inString) {
	this.tipo = inString;
}

FuncaoObjetivo.prototype.setFuncaoObjetivo = function(inArray) {
	var temp;
	for (var i = 0; i < inArray.length; i++){
		this.funcao.variaveis[i] = /([a-zA-Z].*)/.exec(inArray[i])[1];
		temp = inArray[i].replace(/[a-zA-Z].*/, '');
		if (temp == "+"){
			temp = "1";
		}
		else if  (temp == "-"){
			temp = "-1";
		}
		this.funcao.coeficientes[i] = Number(temp);
	}
	this.nome = 'z';
}

/*FuncaoObjetivo.prototype.calcular_max_z = function(inArray) { }*/

FuncaoObjetivo.prototype.verificarSolucao = function () {
	var temp = this.funcao.coeficientes;
	var neg = new Array();
	for (i=0; i<temp.length; i++){
		var aux = temp[i];
		if (aux <= 0) {
			neg[i] = aux;
		} else {
			// AINDA EXISTEM VARIAVEIS QUE PODEM INCREMENTAR O Z
			this.maior_elemento();
		}
	}
	if (neg.length == temp.length){
		//NÃO EXISTEM VARIAVEIS QUE PODEM INCREMENTAR O Z
		//alert (this.maxZ + "A solucao é ótima.");
		return 1;
	}
	return 0;
	
}

FuncaoObjetivo.prototype.maior_elemento= function() {
	var temp = this.funcao.coeficientes;
	var maior = 0;
	for (i=0; i<temp.length; i++){
		var aux = temp[i];
		if (aux > maior) {
			maior = aux;
		}
	}
	this.maior.coeficiente = maior;
	this.maior.variavel = this.funcao.variaveis[temp.indexOf(maior)];
}

FuncaoObjetivo.prototype.recalcular = function(){
		var subx = arguments[0].variavel;
		var subcons = arguments[0].constante;
		var subvars = arguments[0].variaveis;
		var subcoefs = arguments[0].coeficientes;
		var index = this.funcao.variaveis.indexOf(subx);
		var coef = this.funcao.coeficientes[index];
		
		if (index!= -1) {
		
			//mathml da funcaoObjetivo sem a manipulação
			mathmlRecalculoFo(this,'fobjetivo', arguments[1]);
			
			this.funcao.variaveis.splice(index,1,subvars);
			this.funcao.coeficientes.splice(index+1,0,subcoefs);
			
			mathmlRecalculoFo(this,'manip', subcons,arguments[1]);
			
			var tempArray = new Array();
			
			//MULTIPLICA PELO COEFICIENTE DA VARIAVEL QUE SAIU
			for (var i=0; i<this.funcao.coeficientes[index+1].length; i++) {
				tempArray[i] = coef * this.funcao.coeficientes[index+1][i];
			}
			
			var newCons = subcons * coef;
			//this.funcao.constante = newCons;
			this.funcao.coeficientes.splice(index,1);
			this.funcao.coeficientes.splice(index,1,tempArray);
			
			tempArray = [];
			tempArray = this.funcao.variaveis[index].slice(0,this.funcao.variaveis[index].length);
			this.funcao.variaveis.splice(index,1);
			tempArray = tempArray.concat(this.funcao.variaveis);
			this.funcao.variaveis = tempArray;
			
			tempArray = this.funcao.coeficientes[index].slice(0, this.funcao.coeficientes[index].length);
			this.funcao.coeficientes.splice(index,1);
			tempArray = tempArray.concat(this.funcao.coeficientes);
			this.funcao.coeficientes = tempArray;
			
			mathmlRecalculo(this,'final', newCons);
						
			var tempCoef=[];
			var tempVars=[];
			var soma = 0;
			
			for (var i=0; i<this.funcao.variaveis.length;i++) {
				var variavel = this.funcao.variaveis[i];
				var coeficiente = this.funcao.coeficientes[i];
				var tst = tempVars.indexOf(variavel);
				
				if (tst < 0){
					var cont = 0;
					index = [];
					var valor = [];
					for (var j=0; j<this.funcao.variaveis.length; j++) {
						if (variavel == this.funcao.variaveis[j]) {
							index[cont] = j;
							cont++;
						}
					}
					soma = 0;
					
					for (var k=0; k<index.length; k++) {
						valor[k] = this.funcao.coeficientes[index[k]];
						}
					if (index.length > 1) {
						for (var k=0; k<valor.length; k++) {
						soma = soma + valor[k];
						}
					}else{
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
			
			mathmlRecalculoFo(this,'fobjetivo');
		}
}

/* --------------------------------------------------------- */
/*	OBJETO RESTRICAO                                         */
/* --------------------------------------------------------- */

function Restricao() {
	this.funcao = {
		coeficientes : new Array(),
		variaveis : new Array(),
		};
	this.ineq = new String;
	this.constante = new Number();
}

Restricao.prototype.setRestricao = function(inArray) {
	var temp;
	for (var i = 0; i < inArray.length-2; i++){
		this.funcao.variaveis[i] = /([a-zA-Z].*)/.exec(inArray[i])[1];
		temp = inArray[i].replace(/[a-zA-Z].*/, '');
		if (temp == "+"){
			temp = "1";
		}
		else if  (temp == "-"){
			temp = "-1";
		}
		this.funcao.coeficientes[i] = Number(temp);
	}
	this.ineq = inArray[inArray.length-2];
	this.constante = Number(inArray[inArray.length-1]);
}

/* --------------------------------------------------------- */
//	OBJETO PROBLEMA
/* --------------------------------------------------------- */
function Problema() {
	this.funcaoObjetivo = null;
	this.restricoes = new Array();
	this.restNaoNegatividade = null;
}

Problema.prototype.setFuncaoObjetivo = function() {
	this.funcaoObjetivo = arguments[0];
}

Problema.prototype.setRestricoes = function() {
	this.restricoes = arguments[0];
}

Problema.prototype.setRestricoesNn = function() {
	this.restNaoNegatividade = this.funcaoObjetivo.funcao.variaveis;
}

Problema.prototype.getRestricoesNn = function() {
	this.setRestricoesNn();
	return this.restNaoNegatividade;
}

/*Problema.prototype.toMathML = function() {}*/

/* --------------------------------------------------------- */
//	OBJETO folga
/* --------------------------------------------------------- */
function Folga(){
	this.variavel = new Array();
	this.funcao = {
		coeficientes : new Array(),
		variaveis : new Array(),
		constante : null
		};
}

Folga.prototype.setFolga = function() {
	var rest = arguments[0];
	
	this.variavel = "x" + Number(arguments[1]);
	for (var j=0; j< rest.funcao.variaveis.length; j++) {
			this.funcao.coeficientes[j] = Number((rest.funcao.coeficientes[j])*(-1));
			this.funcao.variaveis[j] = rest.funcao.variaveis[j]
		}
	this.funcao.constante = rest.constante;
}

Folga.prototype.recalcular = function() {
	
	//se foi passado a funcao principal da variavel que sera substituida
	if(arguments[0] instanceof Object){
		var subx = arguments[0].variavel;
		var subcons = arguments[0].constante;
		var subvars = arguments[0].variaveis;
		var subcoefs = arguments[0].coeficientes;
		var index = this.funcao.variaveis.indexOf(subx);
		var coef = this.funcao.coeficientes[index];
		
		if (index!= -1) {
			
			//mathml da equação inicial sem a manipulação
			mathmlRecalculo(this,'inicial', arguments[1]);
				
			this.funcao.variaveis.splice(index,1,subvars);
			this.funcao.coeficientes.splice(index+1,0,subcoefs);
			
			mathmlRecalculo(this,'manip', subcons);
						
			//MULTIPLICA PELO COEFICIENTE DA VARIAVEL QUE SAIU
			var tempArray = new Array();
			for (var i=0; i<this.funcao.coeficientes[index+1].length; i++) {
				tempArray[i] = coef * this.funcao.coeficientes[index+1][i];
			}
		
			var newCons = subcons * coef;
			this.funcao.coeficientes.splice(index,1);
			this.funcao.coeficientes.splice(index,1,tempArray);
				
			tempArray = [];
			tempArray = this.funcao.variaveis[index].slice(0,this.funcao.variaveis[index].length);
			this.funcao.variaveis.splice(index,1);
			tempArray = tempArray.concat(this.funcao.variaveis);
			this.funcao.variaveis = tempArray;
			
			tempArray = this.funcao.coeficientes[index].slice(0, this.funcao.coeficientes[index].length);
			this.funcao.coeficientes.splice(index,1);
			tempArray = tempArray.concat(this.funcao.coeficientes);
			this.funcao.coeficientes = tempArray;
			
			mathmlRecalculo(this,'final', newCons);
			
			var tempCoef=[];
			var tempVars=[];
			var soma = 0;
			
			/* Manipulacao algébrica */
			for (var i=0; i<this.funcao.variaveis.length;i++) {
				var variavel = this.funcao.variaveis[i];
				var coeficiente = this.funcao.coeficientes[i];
				var tst = tempVars.indexOf(variavel);
				
				if (tst < 0){
					var cont = 0;
					index = [];
					var valor = [];
					for (var j=0; j<this.funcao.variaveis.length; j++) {
						if (variavel == this.funcao.variaveis[j]) {
							index[cont] = j;
							cont++;
						}
					}
					soma = 0;
					
					for (var k=0; k<index.length; k++) {
						valor[k] = this.funcao.coeficientes[index[k]];
						}
					if (index.length > 1) {
						for (var k=0; k<valor.length; k++) {
						soma = soma + valor[k];
						}
					}else{
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
			
			mathmlRecalculo(this,'final');
		}
	}
	//se foi passado apenas os variaveis que in e out - RECALCULO DA PRINCIPAL
	else {
		var iteracao = arguments[2];
		//mathml da equação inicial sem a manipulação
		mathmlRecalculo(this,'inicial',iteracao);
		
		var sai = arguments[0];
		var entra = arguments[1];
		var aux = [];
		var dec = false;
		
		if(sai!=this.variavel){return alert("Erro.");}
		
		this.variavel = entra;
		
		var aux = new Array();
		var sai = arguments[0];
		var entra = arguments[1]
		
		this.funcao.variaveis.push(sai);
		this.funcao.coeficientes.push(-1);
		
		aux[0] = this.funcao.coeficientes.slice(this.funcao.variaveis.indexOf(entra),this.funcao.variaveis.indexOf(entra)+1); //-2
		this.funcao.coeficientes.splice(this.funcao.variaveis.indexOf(entra),1);
		aux[1] = this.funcao.variaveis.slice(this.funcao.variaveis.indexOf(entra),this.funcao.variaveis.indexOf(entra)+1); // "x1"
		this.funcao.variaveis.splice(this.funcao.variaveis.indexOf(entra),1);
		
		aux[0] = aux[0]*(-1);
		
		var fim = mathmlRecalculo(this, aux[0], iteracao); //MONTAR O MATHML PASSANDO A FUNCAO E O COEFICIENTE DA VARIAVEL QUE ENTROU
		
		var lhs = aux[0];
		var rhs = this.funcao.coeficientes;
		
		for (var i=0; i<rhs.length; i++){
			rhs[i] = rhs[i]/lhs;
		}
		this.funcao.coeficientes = new Array();
		this.funcao.coeficientes = rhs;
		this.funcao.constante = this.funcao.constante / lhs;
		
		if(fim == false){
			mathmlRecalculo(this,'final','style');
		}
	
	}
	
}

Folga.prototype.forcaRestritiva = function() {
	var entra = arguments[0];
	var temp = this.funcao.variaveis.indexOf(entra.variavel);
	var sinal;
	
	var lhs = arguments[1]; //x4
	var cons = this.funcao.constante;
	var rhs = this.funcao.coeficientes[temp]; //
	
	sinal = "gte";
	
	var teste = { lhs: lhs, cons: cons, rhs:rhs };
	
	mathmlafr(teste, entra.variavel, sinal,1);
	
	lhs = rhs;
	rhs = cons*(-1);
	
	
	if (lhs < 0) {
		lhs = lhs*(-1);
		rhs = rhs*(-1);
		sinal = "lte";
	}
	
	var result = rhs/lhs;
	return (result);
	
}

/* --------------------------------------------------------- */
//	OBJETO DICIONARIO
/* --------------------------------------------------------- */

function Dicionario() {
	//this.variaveisBase = new Array();
	this.funcaoFolga = new Array();
	this.funcaoObjetivo = new FuncaoObjetivo();
	this.restricoesNn = new Array();
	this.solucao = new Array();
	this.maiorRestricao = {
					coeficiente: null,
					variavel: null
					};
	this.maxZ = null;
}

Dicionario.prototype.setBase = function() {
	var rest = arguments[0];
	var indVar = problema.funcaoObjetivo.funcao.variaveis.length;
	
	for (var i=1; i<=rest.length; i++) {
		this.funcaoFolga[i-1] = new Folga();
		this.funcaoFolga[i-1].setFolga(rest[i-1],indVar+i); 
	}
}

Dicionario.prototype.setFuncaoObjetivo = function() {
	this.funcaoObjetivo = arguments[0];
}

Dicionario.prototype.setRestricoesNn = function() {
	var vFo = this.funcaoObjetivo.funcao.variaveis;
	var vVf = [];
	
	for(var i=0;i<this.funcaoFolga.length;i++) {
		vVf[i] = this.funcaoFolga[i].variavel;
	}
	
	var temp = this.restricoesNn.concat(vFo, vVf);
	this.restricoesNn = temp;
}

Dicionario.prototype.setSolucao = function() {

	for (var i = 0; i<this.funcaoFolga.length; i++){
		var tempVar =  this.funcaoFolga[i].variavel;
		var tempCons = this.funcaoFolga[i].funcao.constante;
		var tempIndex = this.restricoesNn.indexOf(tempVar);
		this.solucao[tempIndex] = tempCons;
	}
	for (var i = 0; i<this.funcaoObjetivo.funcao.variaveis.length; i++){
		tempVar = this.funcaoObjetivo.funcao.variaveis[i];
		tempIndex = this.restricoesNn.indexOf(tempVar);
		this.solucao[tempIndex] = 0;
	}
}
Dicionario.prototype.getSolucao = function() {
		this.setSolucao();
		return this.solucao;
}

Dicionario.prototype.analise_ff = function() {
	var folga = this.funcaoFolga;
	var fo = this.funcaoObjetivo;
	var entra = fo.maior;
	var temp = new Array();
	var temp2 = null;
	var maiorRestricao = 999;
	var iteracao = arguments[0];

	//PRINTA OS ELEMENTOS DA ESTRUTURA HTML
	//$("<DIV></DIV>").attr("id","afr_"+iteracao+"").appendTo(".wrap");
	//$("<SECTION>Análise de Forças Restritivas - "+iteracao+"ª Iteração</SECTION>").appendTo("#afr_"+iteracao+"");

	//CALCULA A FORÇA RESTRITIVA DE CADA EQUACAO
	for (var i=0; i<folga.length; i++) {
		//$("<DIV CLASS='afrs'></DIV>").appendTo("#afr_"+iteracao+"");
		temp[i] = folga[i].forcaRestritiva(entra, folga[i].variavel);
		
		if (temp[i]>0 && temp[i] < maiorRestricao){
			maiorRestricao = temp[i];
			temp2 = folga[i].variavel;
		}
	}
	
	this.maiorRestricao.variavel = temp2;
}

Dicionario.prototype.recalculoEquacoes = function() {
	var iteracao = arguments[0];
	var base = new Array();
	var entra = this.funcaoObjetivo.maior.variavel;
	var sai = this.maiorRestricao.variavel;
	
	console.log('ENTRA = '+entra);
	console.log('SAI = '+sai);
	
	for (var i=0; i<this.funcaoFolga.length;i++){
		base[i] = this.funcaoFolga[i].variavel;
		if (base[i] == sai) {
			var aux = i;
		}
	}
	
	//montaMatmlRecalculoPrincipal(this.funcaoFolga[aux]);
	
	//recalculo da principal
	this.funcaoFolga[aux].recalcular(sai, entra,iteracao);
	
	var funcao = {
				variavel : this.funcaoFolga[aux].variavel,
				constante : this.funcaoFolga[aux].funcao.constante,
				variaveis : this.funcaoFolga[aux].funcao.variaveis,
				coeficientes : this.funcaoFolga[aux].funcao.coeficientes
			};
	
	//recalculo das demais
	for (var i=0;i<this.funcaoFolga.length;i++){
		if (i!=aux) {
			this.funcaoFolga[i].recalcular(funcao, iteracao);
			//criarRecalculo(this.funcaoFolga[i], iteracao); //
			//montaMathML(this.funcaoFolga[i]);
		}
	}
	
	//recalculo da funcao objetivo
	this.funcaoObjetivo.recalcular(funcao, iteracao);
}

Dicionario.prototype.setMaxZ = function(){
	var max = this.funcaoObjetivo.funcao.constante;
	if (max == null){
		this.maxZ = 0;
	} else {
		this.maxZ = max;
	}
}