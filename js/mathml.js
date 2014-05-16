function mathml_ppl(problema){
  var mathml = monta_mathml_padrao(problema.funcaoObjetivo);
	$("div#inicial div.problema").append("<math><mtext>Max</mtext></math>  " + mathml);
	$("div#inicial div.problema").append("<br /><math><mtext class='mtext'>Sujeito a</mtext></math><br />");
		
	for (var i = 1; i<=problema.restricoes.length; i++){ //MathML Restri��es
		mathml = monta_mathml_restricoes(problema.restricoes[i-1],'rest');
		$("div#inicial div.problema").append("<span>"+mathml+"</span><br />");
	}
	mathml = naoNeg(problema.funcaoObjetivo.funcao.variaveis);
	$("div#inicial div.problema").append(mathml);
}

function naoNeg(vars) {
  var mathml = '<math>';
  for (var i = 0; i < vars.length; i++) {
    mathml += '<msub><mi>' + vars[i].charAt(0) + '</mi><mn>' + vars[i].charAt(1) + '</mn></msub>';
    if (i != vars.length - 1) {
      mathml += '<mo>,</mo>';
    }
  }
  mathml += '<mo>&ge;</mo><mn>0</mn></math>';
  return mathml;
}

function mathml_dicionario(dicionario, iteracao, solucao_otima) {

  for (var i = 1; i <= dicionario.base.length; i++) { //MathML base
    var mathml = monta_mathml_padrao(dicionario.base[i - 1]);
    if (iteracao == 0) {
      $('#inicial .dicionario').append('<div>' + mathml + '</div>');
    } else {
      $('#it' + iteracao + ' .dicionario').append('<div>' + mathml + '</div>');
    }
  }

  // Restrições de não-negatividade
  mathml = naoNeg(dicionario.restricoesNn);
  if (iteracao == 0) {
    $("div#inicial div.dicionario").append('<div class="dic_nao_neg">' + mathml + '</div>');
  } else {
    $('#it' + iteracao + ' .dicionario').append('<div class="dic_nao_neg">' + mathml + '</div>');
  }
  //funcao objetivo
  mathml = monta_mathml_padrao(dicionario.funcaoObjetivo);
  if (iteracao == 0) {
    $("div#inicial div.dicionario").append('<div class="dic_fo">' + mathml + '</div>');
  } else {
    $('#it' + iteracao + ' .dicionario').append('<div class="dic_fo">' + mathml + '</div>');
  }

  //conjunto solucao
  mathml = mathml_conjunto_solucao(dicionario.getSolucao());
  if (iteracao == 0) {
    $("div#inicial div.dicionario").append('<div class="dic_solucao">' + mathml + '</div>');
  } else {
    $('#it' + iteracao + ' .dicionario').append('<div class="dic_solucao">' + mathml + '</div>');
  }

  // Z máximo
  mathml = mathml_z_max(dicionario.maxZ, solucao_otima);
  if (iteracao == 0) {
    $("div#inicial div.dicionario").append('<div>' + mathml + '</div>');
  } else {
    $('#it' + iteracao + ' .dicionario').append('<div>' + mathml + '</div>');
  }
}

function mathml_conjunto_solucao(solucao) {
  var mathml = '<math><mi>S</mi><mo>=</mo><mfenced open="{" close="}" separators=",">';

  for (var i = 1; i <= solucao.length; i++) {
    var num = toFrac(roundSigDig(solucao[i - 1], 15), 1000, .000000001);
    var check = checkString(num, "/", true);

    if (check > 0) {
      mathml += '<mfrac><mn>' + num.toString().substring(0, check) + '</mn><mn>' + num.toString().substring(check + 1, num.lengh) + '</mn></mfrac>';
    } else {
      mathml += '<mn>' + num + '</mn>';
    }
  }
  mathml += '</mfenced></math>';
  return mathml;
}

function mathml_z_max(z, solucao_otima) {
  z = toFrac(roundSigDig(z,15), 1000, .000000001);
  var check = checkString(z,"/",true);
  var mathml = '<math>';
  if (solucao_otima == true) {
    mathml += '<mtext class="mtext">Max</mtext><mspace width="5px"/>';
  }
  mathml += '<mi>Z</mi><mo>=</mo>';
  if (check > 0) {
    mathml+='<mfrac><mn>'+z.toString().substring(0,check)+'</mn><mn>'+z.toString().substring(check+1, z.lengh) + '</mn></mfrac>';
  } else {
    mathml+='<mn>'+z+'</mn>';
  }
  mathml+='</math>';
  return mathml;
}

function mathmlRecalculo(){
	var fim = false;
	switch(arguments[1]){
		case 'inicial':
			var iteracao = arguments[2];
			var funcao   = arguments[0];
			var mathml   = monta_mathml_padrao(funcao);
			$('#it'+iteracao+' > .recalculo').append('<div class="rec_eq"></div>');
			$('.rec_eq').last().append('<div>'+mathml+'</div>');
		break;
		case 'final':
			var funcao = arguments[0];
			var mathml = '';
			if (funcao.nome == "z") {
				if(arguments.length == 3){
					var newCons = arguments[2];
					mathml += monta_mathml_padrao(funcao,newCons);
				} else {
					mathml += monta_mathml_padrao(funcao);
				}
			} else {
				if( arguments.length == 3 && isNumber(arguments[2]) ){
					var newCons = arguments[2];
					mathml += monta_mathml_padrao(funcao,newCons);
				} else if (arguments[2] == 'style'){
					mathml += monta_mathml_padrao(funcao, null, 'style');
				} else {
					mathml += monta_mathml_padrao(funcao);
				}
			}
			$('.rec_eq').last().append('<div>'+mathml+'</div>');

		break;
		case 'manip':
			var funcao = arguments[0];
			var subcons = arguments[2];
			var funcaop1 = new Folga();
			var funcaop2 = new Folga();
			var funcaop3 = new Folga();
			var mathml;
			for(var i = 0; i<funcao.funcao.coeficientes.length; i++){
				if( !(funcao.funcao.coeficientes[i] instanceof Array) && !(funcao.funcao.variaveis[i] instanceof Array) && funcaop2.funcao.coeficientes.length == 0){
					funcaop1.funcao.coeficientes[i] = funcao.funcao.coeficientes[i];
					funcaop1.funcao.variaveis[i]  = funcao.funcao.variaveis[i];
 				} else if( !(funcao.funcao.coeficientes[i] instanceof Array) && (funcao.funcao.variaveis[i] instanceof Array) ){
					funcaop1.funcao.coeficientes[i] = funcao.funcao.coeficientes[i];
					funcaop2.funcao.constante = subcons;
					for (var j=0; j<funcao.funcao.variaveis[i].length; j++) {
						funcaop2.funcao.coeficientes[j] = funcao.funcao.coeficientes[i+1][j];
						funcaop2.funcao.variaveis[j] = funcao.funcao.variaveis[i][j];
					}
				} else {
					break;
				}
			}
			j=0;
			do{
				funcaop3.funcao.coeficientes[j] = funcao.funcao.coeficientes[i+1];
				funcaop3.funcao.variaveis[j] = funcao.funcao.variaveis[i];
				i++;
				j++;
			} while (!(funcao.funcao.coeficientes[i+1] == undefined));
			
      if (funcao.nome == 'z') {
        mathml = monta_mathml_rec_obj_subst(funcao, funcaop1, funcaop2, funcaop3);
      } else {
        mathml = monta_mathml_rec_subst(funcao, funcaop1, funcaop2, funcaop3);
      }
						
			$('.rec_eq').last().append('<div>'+mathml+'</div>');
		break;
		
		default:
			var funcao = arguments[0];
			var inCoef = arguments[1];
			var inCoefFrac;
			var mathml;
			var aux = new Folga();
			
			/****** PASSANDO O ELEMENTO QUE ENTRA E O QUE SAI *****/
			mathml = monta_mathml_rec_principal_segunda_etapa(funcao, inCoef);
			$('.rec_eq').last().append('<div>'+mathml+'</div>');
			/**************************************************/
			
			inCoefFrac = toFrac(roundSigDig(inCoef,15) , 1000, .000000001)
			var check = checkString(inCoefFrac,"/",true);
			if(check > 0){
				mathml = monta_mathml_rec_principal_terceira_etapa_fracoes(funcao, inCoefFrac);
				$('.rec_eq').last().append('<div>'+mathml+'</div>');
			}else		
				/****** PASSANDO O COEFICIENTE PARA A DIVISÃO *****/
				if(inCoef !=0 && inCoef != 1){
					for(var i=0;i<funcao.funcao.variaveis.length;i++){
						aux.funcao.coeficientes[i] = funcao.funcao.coeficientes[i] +'/'+ inCoef;
						aux.funcao.variaveis[i] = funcao.funcao.variaveis[i];
						
						if(funcao.funcao.coeficientes[i] % inCoef != 0){
							fim = true;
						}
						
					}
					aux.funcao.constante = funcao.funcao.constante +'/'+ inCoef;
					if(funcao.funcao.constante % inCoef == 0){
						fim = false;
					}
						
					aux.variavel = funcao.variavel;
					
					mathml = monta_mathml_rec_principal_terceira_etapa(aux,fim);
					$('.rec_eq').last().append('<div>'+mathml+'</div>');
				} else if (inCoef==1){
					fim = true;
				}
			/**************************************************/
	}
	return (fim);
}

function monta_mathml_restricoes(funcao) {

	/*  DECLARACAO DAS VARIAVEIS  */
	var vars = funcao.funcao.variaveis;
	var coef = funcao.funcao.coeficientes;
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fraçao
	var check=''; // variavel para verificar se frac é uma fracao ou numero inteiro
	
	/*  COEFICIENTES E VARIAVEIS   */
	for (var i=0; i<coef.length; i++) {
		frac = toFrac(roundSigDig(coef[i],15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENTAO É UMA FRAÇÃO
		
			switch(frac.charAt(0)) { //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>';
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // POSITIVO
					if(cons != null || cons != undefined){ // SE A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO
						mathml += '<mo>+</mo>';
					}
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>'
					if ((frac != -1) && (frac != 0)) {
						mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
					}
				break;
				default: // POSITIVO
					// SE FOR O PRIMEIRO ELEMENTO E A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO OU SE FOR OS OUTROS ELEMENTOS  TBM DEVE APRESENTAR O POSITIVO
					if (i!=0) {
						mathml += '<mo>+</mo>';
                    }
                    if ((frac != 1) && (frac != 0)) {
                        mathml += '<mn>'+frac+'</mn>';
                    }
			}
		}
		if (frac != 0) { // s� mostra a variavel se o coeficiente for diferente de 0
		mathml += '<msub><mi>'+vars[i].charAt(0)+'</mi><mn>'+vars[i].charAt(1)+'</mn></msub>';
		}	
	}
    mathml += '<mo>&le;</mo>';
    mathml += '<mn>'+funcao.constante+'</mn>';
	mathml += '</math>';
	return(mathml);
}

function monta_mathml_padrao(funcao, cons2, style) {

	/* DECLARACAO DAS VARIAVEIS  */
	var xn;
  var z = funcao.nome;
	var cons = funcao.funcao.constante;
	var vars = funcao.funcao.variaveis;
	var coef = funcao.funcao.coeficientes;
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fra??o
	var check=''; // variavel para verificar se frac ? uma frac?o ou numero inteiro
	/* ***** */
	
	/* LHS DA FUNCAO */
  if (z == 'z') {
    mathml += "<mi>Z</mi><mo>=</mo>";
  } else {
    xn = funcao.variavel; 
    mathml += "<msub><mi>"+xn.charAt(0)+"</mi><mn>"+xn.charAt(1)+"</mn></msub><mo>=</mo>";
  }
  if (style == 'style') {
    mathml += "<mstyle mathcolor='red'>";
  }
	/* ***** */
	
	/*  CONSTANTE  */
	if (cons != null) {
		frac = toFrac(roundSigDig(cons,15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENTAO É UMA FRACAO
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // positivo
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				break;
				default: // positivo
					mathml += '<mn>'+frac+'</mn>';
			}
		}
	}
  if (cons2 != null) {
		frac = toFrac(roundSigDig(cons2,15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT?O ? UMA FRA??O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // positivo
					mathml += '<mo>+</mo>'
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				break;
				default: // positivo
					if (cons != null) {
						mathml += '<mo>+</mo>'
					}
					mathml += '<mn>'+frac+'</mn>';
			}
		}
		
	}
	/* ****** */
	/* ****** */
	
	/*  COEFICIENTES E VARIAVEIS   */
	for (var i=0; i<coef.length; i++) {
		frac = toFrac(roundSigDig(coef[i],15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT?O ? UMA FRA??O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>';
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // POSITIVO
					if(cons != null || cons != undefined || cons2 != null){ // SE A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO
						mathml += '<mo>+</mo>';
					}
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>'
					if ((frac != -1) && (frac != 0)) {
						mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
					}
				break;
				default: // POSITIVO
					// SE FOR O PRIMEIRO ELEMENTO E A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO OU SE FOR OS OUTROS ELEMENTOS  TBM DEVE APRESENTAR O POSITIVO
          if( ((i==0) && (cons != null || cons != undefined)) || i!=0 || !( (i==0) && (cons==null || cons==undefined ) )){ 
						if (frac != 0){
							mathml += '<mo>+</mo>';
						}
					}
          if ((frac != 1) && (frac != 0)) {
						mathml += '<mn>'+frac+'</mn>';
					}
			}
			
		}
		
		if (frac != 0) { // só mostra a variavel se o coeficiente for diferente de 0
			mathml += '<msub><mi>'+vars[i].charAt(0)+'</mi><mn>'+vars[i].charAt(1)+'</mn></msub>';
		}
		
	}
	/* ****** */
  if (style == 'style') {
    mathml += "</math>";
  }
	mathml += "</math>";
	return(mathml);
}

function monta_mathml_rec_principal_segunda_etapa(funcao, inCoef) {

	/* DECLARACAO DAS VARIAVEIS  */
	var xn = funcao.variavel; /* NOME DA FUNCAO -- (X4 = ) */
	var cons = funcao.funcao.constante;
	var vars = funcao.funcao.variaveis;
	var coef = funcao.funcao.coeficientes;
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fra��o
	var check=''; // variavel para verificar se frac � uma frac�o ou numero inteiro
	/* ***** */
	
	/* LHS DA FUNCAO */
	
	frac = toFrac(roundSigDig(inCoef,15) , 1000, .000000001);
	check = checkString(frac,"/",true);  //verificar se � uma fra��o
	
	if (check > 0) {
		switch(frac.charAt(0)){
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			break;
			default: // positivo
				mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
		}
		
	} else {
		
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				if (frac != -1) {
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				}
			break;
			default: // positivo
			if (frac != 1) {
				mathml += '<mn>'+frac+'</mn>';
			}
				
		}
	}
	
	mathml += "<msub><mi>"+xn.charAt(0)+"</mi><mn>"+xn.charAt(1)+"</mn></msub><mo>=</mo>";
	/* ***** */
	
	if (inCoef == 1 || inCoef== -1){
		mathml += '<mstyle mathcolor="red">';
	}
	
	/*  CONSTANTE  */
	if (cons != null) {
		frac = toFrac(roundSigDig(cons,15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // positivo
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					if (frac != -1) {
						mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
					}
				break;
				default: // positivo
					mathml += '<mn>'+frac+'</mn>';
			}
		}
		
	}
	/* ****** */
	
	/*  COEFICIENTES E VARIAVEIS   */
	for (var i=0; i<coef.length; i++) {
		frac = toFrac(roundSigDig(coef[i],15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>';
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // POSITIVO
					if(cons != null || cons != undefined){ // SE A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO
						mathml += '<mo>+</mo>';
					}
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>'
					if ((frac != -1) && (frac != 0)) {
						mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
					}
				break;
				default: // POSITIVO
					// SE FOR O PRIMEIRO ELEMENTO E A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO OU SE FOR OS OUTROS ELEMENTOS  TBM DEVE APRESENTAR O POSITIVO
					if( ((i==0) && (cons != null || cons != undefined)) || i!=0 || !( (i==0) && (cons==null || cons==undefined ) )){
						if (frac != 0) {
							mathml += '<mo>+</mo>';
							if ((frac != 1)) {
								mathml += '<mn>'+frac+'</mn>';
							}
						}
					}
			}
			
		}
		
		if (frac != 0) { // s� mostra a variavel se o coeficiente for diferente de 0
			mathml += '<msub><mi>'+vars[i].charAt(0)+'</mi><mn>'+vars[i].charAt(1)+'</mn></msub>';
		}
		
	}
	/* ****** */
	if (inCoef == 1 || inCoef == -1){
		mathml += '</mstyle>';
	}
	mathml += '</math>';
	return(mathml);
}

function monta_mathml_rec_principal_terceira_etapa(funcao) {

	/* DECLARACAO DAS VARIAVEIS  */
	var xn = funcao.variavel; /* NOME DA FUNCAO -- (X4 = ) */
	var cons = funcao.funcao.constante;
	var vars = funcao.funcao.variaveis;
	var coef = funcao.funcao.coeficientes;
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fracao
	var check= ''; // variavel para verificar se frac é uma fracao ou numero inteiro
	var fim = arguments[1];
	/* ***** */
	
	/* LHS DA FUNCAO */
	mathml += "<msub><mi>"+xn.charAt(0)+"</mi><mn>"+xn.charAt(1)+"</mn></msub><mo>=</mo>";
	if(fim==true){mathml +='<mstyle mathcolor="red">'};
	/* ***** */
	
	/*  CONSTANTE  */
	if (cons != null) {
		//frac = toFrac(roundSigDig(cons,15) , 1000, .000000001);
		check = checkString(cons,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENTAO É UMA FRACAO
		
			switch(cons.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mfrac><mn>'+cons.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // positivo
					mathml += '<mfrac><mn>'+cons.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(cons.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mn>'+cons.substring(1,cons.length)+'</mn>';
				break;
				default: // positivo
					mathml += '<mn>'+cons+'</mn>';
			}
		}
		
	}
	/* ****** */
	
	/*  COEFICIENTES E VARIAVEIS   */
	for (var i=0; i<coef.length; i++) {
		//frac = toFrac(roundSigDig(coef[i],15) , 1000, .000000001);
		check = checkString(coef[i],"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(coef[i].charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>';
					mathml += '<mfrac><mn>'+coef[i].substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+coef[i].substring(check+1, coef[i].length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // POSITIVO
					if(cons != null || cons != undefined){ // SE A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO
						mathml += '<mo>+</mo>';
					}
					mathml += '<mfrac><mn>'+coef[i].substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+coef[i].substring(check+1, coef[i].length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(coef[i].charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>'
					if ((coef[i] != -1) && (coef[i] != 0)) {
						mathml += '<mn>'+coef[i].substring(1,coef[i].length)+'</mn>';
					}
				break;
				default: // POSITIVO
					// SE FOR O PRIMEIRO ELEMENTO E A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO OU SE FOR OS OUTROS ELEMENTOS  TBM DEVE APRESENTAR O POSITIVO
					if( ((i==0) && (cons != null || cons != undefined)) || i!=0 || !( (i==0) && (cons==null || cons==undefined ) )){ 
						mathml += '<mo>+</mo>';
						if ((coef[i] != 1) && (coef[i] != 0)) {
							mathml += '<mn>'+coef[i]+'</mn>';
						}
					}
			}
			
		}
		
		if (coef[i] != 0) { // s� mostra a variavel se o coeficiente for diferente de 0
			mathml += '<msub><mi>'+vars[i].charAt(0)+'</mi><mn>'+vars[i].charAt(1)+'</mn></msub>';
		}
		
	}
	/* ****** */	
	if(fim==true){mathml +='</mstyle>'};
	mathml += '</math>';
	return(mathml);
}

function monta_mathml_rec_principal_terceira_etapa_fracoes(funcao, inFrac) {

	/* DECLARACAO DAS VARIAVEIS  */
	var xn = funcao.variavel; /* NOME DA FUNCAO -- (X4 = ) */
	var cons = funcao.funcao.constante;
	var vars = funcao.funcao.variaveis;
	var coef = funcao.funcao.coeficientes;
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fra��o
	var check=''; // variavel para verificar se frac � uma frac�o ou numero inteiro
	/* ***** */
	
	/* LHS DA FUNCAO */
	mathml += "<msub><mi>"+xn.charAt(0)+"</mi><mn>"+xn.charAt(1)+"</mn></msub><mo>=</mo>";
	/* ***** */
	
	/*  CONSTANTE  */
	if (cons != null) {
		frac = toFrac(roundSigDig(cons,15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo><mfrac>'
					mathml += '<mfrac bevelled="true"><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // positivo
					mathml += '<mfrac><mfrac bevelled="true"><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo><mfrac>'
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				break;
				default: // positivo
					mathml += '<mfrac><mn>'+frac+'</mn>';
			}
		}
		check = checkString(inFrac,"/",true);
		mathml += '<mfrac bevelled="true"><mn>'+inFrac.substring(0,check)+'</mn>'; //NUMERADOR
		mathml += '<mn>'+inFrac.substring(check+1, inFrac.length)+'</mn></mfrac></mfrac>'; //DENOMIDADOR
	}
	/* ****** */
	
	/*  COEFICIENTES E VARIAVEIS   */
	for (var i=0; i<coef.length; i++) {
		frac = toFrac(roundSigDig(coef[i],15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo><mfrac>';
					mathml += '<mfrac bevelled="true"><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // POSITIVO
					if(cons != null || cons != undefined){ // SE A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO
						mathml += '<mo>+</mo>';
					}
					mathml += '<mfrac><mfrac bevelled="true"><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			check = checkString(inFrac,"/",true);
			mathml += '<mfrac bevelled="true"><mn>'+inFrac.substring(0,check)+'</mn>'; //NUMERADOR
			mathml += '<mn>'+inFrac.substring(check+1, inFrac.length)+'</mn></mfrac></mfrac>'; //DENOMIDADOR
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo><mfrac>'
					if (/*(frac != -1) &&*/ (frac != 0)) {
						mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
					}
				break;
				default: // POSITIVO
					// SE FOR O PRIMEIRO ELEMENTO E A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO OU SE FOR OS OUTROS ELEMENTOS  TBM DEVE APRESENTAR O POSITIVO
					if( ((i==0) && (cons != null || cons != undefined)) || i!=0 || !( (i==0) && (cons==null || cons==undefined ) )){ 
						if (/*(frac != 1) &&*/ (frac != 0)) {
							mathml += '<mo>+</mo><mfrac>';
							mathml += '<mn>'+frac+'</mn>';
						}
					}
			}
			if (frac != 0){
				check = checkString(inFrac,"/",true);
				mathml += '<mfrac bevelled="true"><mn>'+inFrac.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+inFrac.substring(check+1, inFrac.length)+'</mn></mfrac></mfrac>'; //DENOMIDADOR
			}
			
		}
		
			
		if (frac != 0) { // s� mostra a variavel se o coeficiente for diferente de 0
			mathml += '<msub><mi>'+vars[i].charAt(0)+'</mi><mn>'+vars[i].charAt(1)+'</mn></msub>';
		}
		
	}
	/* ****** */	
	mathml += '</math>';
	return(mathml);
}

function monta_mathml_rec_subst(){
	var funcao = arguments[0];
	var funcaop1 = arguments[1];
	var funcaop2 = arguments[2];
	var funcaop3 = arguments[3];
	var mathml = '<math>'
	
	mathml += '<msub><mi>'+funcao.variavel.charAt(0)+'</mi><mn>'+funcao.variavel.charAt(1)+'</mn></msub><mo>=</mo>';
	var frac = toFrac(roundSigDig(funcao.funcao.constante,15) , 1000, .000000001);
	var check = checkString(frac,"/",true);  //verificar se � uma fra��o
	if (check > 0) {
			mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn><mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>';
	} else {
			mathml += '<mn>'+frac+'</mn>';
	}
	
	if (funcaop1.funcao.variaveis.length == 0){
		var cons = toFrac(roundSigDig(funcaop1.funcao.coeficientes[0],15) , 1000, .000000001); //funcaop1.funcao.coeficientes[0].toString();
		var check = checkString(cons,"/",true);
		if (check > 0) {
			if (cons.charAt(0) == "-"){
				mathml += '<mo>-</mo>';
				mathml += '<mfrac><mn>'+cons.substring(1,check)+'</mn><mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>';
			} else {
				mathml += '<mo>+</mo>';
				mathml += '<mfrac><mn>'+cons.substring(0,check)+'</mn><mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>';
			}
		} else {
			if (cons.charAt(0) == "-"){
				mathml += '<mo>-</mo>';
				if((cons.substring(1,cons.length)) != 1){
					mathml += '<mn>'+cons.substring(1,cons.length)+'</mn>';
				}
			} else {
				mathml += '<mo>+</mo>';
			}
		}
		mathml +='<mstyle mathcolor="red"><mo>(</mo>';
	}else {
		mathml += monta_mathml_rec_subst_part(funcaop1);
		mathml +='<mstyle mathcolor="red"><mo>(</mo>';
	}
	
	mathml += monta_mathml_rec_subst_part(funcaop2);
	mathml += '<mo>)</mo></mstyle>';
			
	//funcaop3
	if(typeof funcaop3.funcao.coeficientes[0] != 'undefined') {
		mathml += monta_mathml_rec_subst_part(funcaop3);
	}
	mathml += '</math>';
	return (mathml);
}

function monta_mathml_rec_subst_part(funcao) {
	/* DECLARACAO DAS VARIAVEIS  */
	var cons = funcao.funcao.constante;
	var vars = funcao.funcao.variaveis;
	var coef = funcao.funcao.coeficientes;
	var mathml = '';
	var frac = ''; //variavel usada para tranformar o decimal em fra��o
	var check=''; // variavel para verificar se frac � uma frac�o ou numero inteiro
	/* ***** */
	
	/*  CONSTANTE  */
	if (cons != null) {
		frac = toFrac(roundSigDig(cons,15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // positivo
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				break;
				default: // positivo
					mathml += '<mn>'+frac+'</mn>';
			}
		}
		
	}
	
	/* ****** */
	
	/*  COEFICIENTES E VARIAVEIS   */
	for (var i=0; i<coef.length; i++) {
		frac = toFrac(roundSigDig(coef[i],15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>';
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // POSITIVO
					mathml += '<mo>+</mo>';
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>'
					if ((frac != -1) && (frac != 0)) {
						mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
					}
				break;
				default: // POSITIVO
					if (frac != 0) {
            //if (cons != null && i != 0 ) {
						  mathml += '<mo>+</mo>'
            //}
						if ((frac != 1)) {
							mathml += '<mn>'+frac+'</mn>';
						}
					}
			}
			
		}
		
		if (frac != 0 && vars[i] != null) { // s� mostra a variavel se o coeficiente for diferente de 0
			mathml += '<msub><mi>'+vars[i].charAt(0)+'</mi><mn>'+vars[i].charAt(1)+'</mn></msub>';
		}
		
	}
	/* ****** */	
	//mathml += '</math>';
	return(mathml);
}

function monta_mathml_rec_obj_subst(){
	var funcao = arguments[0];
	var funcaop1 = arguments[1];
	var funcaop2 = arguments[2];
	var funcaop3 = arguments[3];
	var mathml = '<math><mi>Z</mi><mo>=</mo>'
	
	if(funcao.funcao.constante != null){
			
		var cons = toFrac(roundSigDig(funcao.funcao.constante,15) , 1000, .000000001); //funcaop1.funcao.coeficientes[0].toString();
		var check = checkString(cons,"/",true);
		if (check > 0) {
			if (cons.charAt(0) == "-"){
				mathml += '<mo>-</mo>';
				mathml += '<mfrac><mn>'+cons.substring(1,check)+'</mn><mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>';
			} else {
				//mathml += '<mo>+</mo>';
				mathml += '<mfrac><mn>'+cons.substring(0,check)+'</mn><mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>';
			}
		} else {
			if (cons.charAt(0) == "-"){
				mathml += '<mo>-</mo>';
				if((cons.substring(1,cons.length)) != 1){
					mathml += '<mn>'+cons.substring(1,cons.length)+'</mn>';
				}
			} else {
				//mathml += '<mo>+</mo>';
				mathml += '<mn>'+cons+'</mn>';
			}
		}
	}
			
	if (funcaop1.funcao.variaveis.length == 0){
			
		var cons = toFrac(roundSigDig(funcao.maior.coeficiente,15) , 1000, .000000001); //funcaop1.funcao.coeficientes[0].toString();
		var check = checkString(cons,"/",true);
		if (check > 0) {
			if (cons.charAt(0) == "-"){
				mathml += '<mo>-</mo>';
				mathml += '<mfrac><mn>'+cons.substring(1,check)+'</mn><mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>';
			} else {
				mathml += '<mo>+</mo>';
				mathml += '<mfrac><mn>'+cons.substring(0,check)+'</mn><mn>'+cons.substring(check+1, cons.length)+'</mn></mfrac>';
			}
		} else {
			if (cons.charAt(0) == "-"){  //NEGATIVO
				mathml += '<mo>-</mo>';
				if((cons.substring(1,cons.length)) != 1){
					mathml += '<mn>'+cons.substring(1,cons.length)+'</mn>';
				}
			} else { //POSITIVO
				if (funcao.funcao.constante != null) {
					mathml += '<mo>+</mo>';
				}
				if (cons!=1){
					mathml += '<mn>'+cons+'</mn>';
				}
			}
		}
	}
	if (funcaop1.funcao.variaveis.length != 0){
		var mathmlp1 = monta_mathml_rec_subst_part(funcaop1);
		mathml += mathmlp1;
	}
	mathml +='<mstyle mathcolor="red"><mo>(</mo>';
	//*************funcaop1 *************//

	//funcaop2
	mathml += monta_mathml_rec_subst_part(funcaop2);
	mathml += '<mo>)</mo></mstyle>';

	//funcaop3
	if(typeof funcaop3.funcao.coeficientes[0] != 'undefined') {
		mathml += monta_mathml_rec_subst_part(funcaop3);
	}
	
	mathml += '</math>';
	return (mathml);
}

function mathml_afr() {
  var aux = arguments[0];
  for (var i = 0; i < aux.length; i++) {
    for (var j = 1; j < aux[i].length; j++) {
      switch (aux[i][j].tipo) {
      case 'inicial':
        var iteracao = aux[i][j].iteracao;
        $('#it' + iteracao + ' > .analise_fr').append('<div class="afr"></div>');
        var mathml = monta_mathml_afr(aux[i][j].lhs, aux[i][j].cons, aux[i][j].rhs, aux[i][j].inVar);
        $('.afr').last().append('<div>' + mathml + '</div>');
        break;
      case 'second': //'second',lhs,inVar.variavel,rhs
        var style = false;
        if (j == aux[i].length - 1 && aux[i][0] == 'maior_restricao') {
          style = true;
        }
        var inCoef = aux[i][j].lhs;
        var inVar = aux[i][j].inVar;
        var rhs = aux[i][j].rhs;
        var sinal = aux[i][j].sinal;
        var mathml = monta_mathml_afr_second(inCoef, inVar, rhs, sinal, style);
        $('.afr').last().append('<div>' + mathml + '</div>');
        break;
      case 'third': //'third',lhs,inVar.variavel,rhs,sinal
        var style = false;
        if (j == aux[i].length - 1 && aux[i][0] == 'maior_restricao') {
          style = true;
        }
        var lhs = aux[i][j].lhs; //1.5
        var rhs = aux[i][j].rhs;
        var inVar = aux[i][j].inVar;
        var sinal = aux[i][j].sinal;

        var lhsFrac = toFrac(roundSigDig(lhs, 15), 1000, .000000001)
        var check = checkString(lhsFrac, "/", true);
        if (check > 0) {
          var mathml = monta_mathml_afr_third_denfrac(inVar, lhsFrac, rhs, sinal, style);
          $('.afr').last().append('<div>' + mathml + '</div>');
        } else {
          var frac = rhs + '/' + lhs;
          var mathml = monta_mathml_afr_third(inVar, frac, sinal, style);
          $('.afr').last().append('<div>' + mathml + '</div>');
        }
        break;
      case 'fourth': //'fourth',inVar.variavel,result,sinal
        var inVar = aux[i][j].inVar;
        var result = aux[i][j].result;
        var sinal = aux[i][j].sinal;
        var style = false;
        if (j == aux[i].length - 1 && aux[i][0] == 'maior_restricao') {
          style = true;
        }
        var mathml = monta_mathml_afr_fourth(inVar, sinal, result, style);
        $('.afr').last().append('<div>' + mathml + '</div>');
        break;
      }
    }
  }
}

function monta_mathml_afr(){
	/* DECLARACAO DAS VARIAVEIS  */
	var xn = arguments[0]; /* NOME DA FUNCAO -- (X4 = ) */
	var cons = arguments[1];
	var coef = arguments[2];
	var inVar = arguments[3];
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fra��o
	var check=''; // variavel para verificar se frac � uma frac�o ou numero inteiro
	/* ***** */
	
	/* LHS DA FUNCAO */
	mathml += "<msub><mi>"+xn.charAt(0)+"</mi><mn>"+xn.charAt(1)+"</mn></msub><mo>=</mo>";
	/* ***** */
	
	/*  CONSTANTE  */
	if (cons != null) {
		frac = toFrac(roundSigDig(cons,15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // positivo
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // negativo
					mathml += '<mo>-</mo>'
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				break;
				default: // positivo
					mathml += '<mn>'+frac+'</mn>';
			}
		}
		
	}
	/* ****** */
	
	/*  COEFICIENTE E VARIAVEL   */
	//for (var i=0; i<coef.length; i++) {
		frac = toFrac(roundSigDig(coef,15) , 1000, .000000001);
		check = checkString(frac,"/",true);
		
		if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>';
					mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
				break;
				default: // POSITIVO
					if(cons != null || cons != undefined){ // SE A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO
						mathml += '<mo>+</mo>';
					}
					mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
					mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			}
			
		} else { // CHECK < ZERO =  NUMERO INTEIRO 
		
			switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
				case '-':  // NEGATIVO
					mathml += '<mo>-</mo>'
					if ((frac != -1) && (frac != 0)) {
						mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
					}
				break;
				default: // POSITIVO
					// SE FOR O PRIMEIRO ELEMENTO E A FUNCAO TIVER CONSTANTE DEVE-SE APRESENTAR O SINAL POSITIVO OU SE FOR OS OUTROS ELEMENTOS  TBM DEVE APRESENTAR O POSITIVO
					if( ((i==0) && (cons != null || cons != undefined)) || i!=0 || !( (i==0) && (cons==null || cons==undefined ) )){ 
						mathml += '<mo>+</mo>';
						if ((frac != 1) && (frac != 0)) {
							mathml += '<mn>'+frac+'</mn>';
						}
					}
			}
			
		}
		
		if (frac != 0) { // s� mostra a variavel se o coeficiente for diferente de 0
			mathml += '<msub><mi>'+inVar.charAt(0)+'</mi><mn>'+inVar.charAt(1)+'</mn></msub>';
		}
		
	//}
	/* ****** */	
	mathml += '<mo>&ge;</mo><mn>0</mn></math>';
	return(mathml);
}

function monta_mathml_afr_second(){
	/* DECLARACAO DAS VARIAVEIS  */
	var inCoef = arguments[0];
	var inVar = arguments[1];
	var rhs   = arguments[2];
	var sinal = arguments[3];
	var style = arguments[4];
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fra��o
	var check=''; // variavel para verificar se frac � uma frac�o ou numero inteiro
	/* ***** */
	
	if(style == true){
        mathml += '<mstyle mathcolor="red">';
    }
	
	/* LHS DA FUNCAO */
	frac = toFrac(roundSigDig(inCoef,15) , 1000, .000000001);
	check = checkString(frac,"/",true);
	if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			break;
			default: // positivo
				mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
		}
		
	} else { // CHECK < ZERO =  NUMERO INTEIRO 
	
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				if(frac!=-1){
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				}
			break;
			default: // positivo
				if(frac!=1){
					mathml += '<mn>'+frac+'</mn>';
				}
		}
	}

	mathml += "<msub><mi>"+inVar.charAt(0)+"</mi><mn>"+inVar.charAt(1)+"</mn></msub>";
	if (sinal == 'ge') {
		mathml += "<mo>&ge;</mo>";
	}else if (sinal == 'le'){
		mathml += "<mo>&le;</mo>"
	}
	/* ***** */
	
	/*  CONSTANTE  */
	frac = toFrac(roundSigDig(rhs,15) , 1000, .000000001);
	check = checkString(frac,"/",true);
	if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			break;
			default: // positivo
				mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
		}
		
	} else { // CHECK < ZERO =  NUMERO INTEIRO 
	
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
			break;
			default: // positivo
				mathml += '<mn>'+frac+'</mn>';
		}
	}
	/* ****** */	
	
	if(style == true){
        mathml += '</mstyle>';
    }
	
	mathml += '</math>';
	return(mathml);
}

function monta_mathml_afr_third(){
	/* DECLARACAO DAS VARIAVEIS  */
	var inVar = arguments[0];
	var rhs   = arguments[1];
	var sinal = arguments[2];
	var style = arguments[3];
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fracao
	var check=''; // variavel para verificar se frac é uma fracao ou numero inteiro
	/* ***** */
	
	if(style == true){
        mathml += '<mstyle mathcolor="red">';
    }
	
	/* LHS DA FUNCAO */
	mathml += "<msub><mi>"+inVar.charAt(0)+"</mi><mn>"+inVar.charAt(1)+"</mn></msub>";
	if (sinal == 'ge') {
		mathml += "<mo>&ge;</mo>";
	}else if (sinal == 'le'){
		mathml += "<mo>&le;</mo>"
	}
	/* ***** */
	
	check = checkString(rhs,"/",true);
	if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
		
		switch(rhs.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mfrac><mn>'+rhs.substring(1,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+rhs.substring(check+1, rhs.length)+'</mn></mfrac>'; //DENOMIDADOR
			break;
			default: // positivo
				mathml += '<mfrac><mn>'+rhs.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+rhs.substring(check+1, rhs.length)+'</mn></mfrac>'; //DENOMIDADOR
		}
		
	} else { // CHECK < ZERO =  NUMERO INTEIRO 
	
		switch(rhs.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				if(rhs!=-1){
					mathml += '<mn>'+rhs.substring(1,rhs.length)+'</mn>';
				}
			break;
			default: // positivo
				if(rhs!=1){
					mathml += '<mn>'+rhs+'</mn>';
				}
		}
	}
	/* ***** */
	if(style == true){
		mathml += '</mstyle>';
	}
	mathml += '</math>';
	return(mathml);
}

function monta_mathml_afr_third_denfrac(){
	/* DECLARACAO DAS VARIAVEIS  */
	var inVar   = arguments[0]; /* NOME DA FUNCAO -- (X4 = ) */
	var lhsFrac = arguments[1];
	var rhs 	= arguments[2];
	var sinal   = arguments[3];
	var style   = arguments[4];
	var mathml  = '<math>';
	var frac 	= ''; 			//variavel usada para tranformar o decimal em fra��o
	var check	=''; 			// variavel para verificar se frac � uma frac�o ou numero inteiro
	/* ***** */
	
	if(style == true){
        mathml += '<mstyle mathcolor="red">';
    }
	
	/* LHS DA FUNCAO */
	mathml += "<msub><mi>"+inVar.charAt(0)+"</mi><mn>"+inVar.charAt(1)+"</mn></msub>";
	if (sinal == 'ge') {
		mathml += "<mo>&ge;</mo>";
	}else if (sinal == 'le'){
		mathml += "<mo>&le;</mo>"
	}
	/* ***** */
	
	/*  CONSTANTE  */
	
	frac = toFrac(roundSigDig(rhs,15) , 1000, .000000001);
	check = checkString(frac,"/",true);
	
	if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
	
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mfrac>';
				mathml += '<mfrac bevelled="true"><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			break;
			default: // positivo
				mathml += '<mfrac>';
				mathml += '<mfrac bevelled="true"><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
		}
		
	} else { // CHECK < ZERO =  NUMERO INTEIRO 
	
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mfrac>';
				mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
			break;
			default: // positivo
				mathml += '<mfrac>';
				mathml += '<mn>'+frac+'</mn>';
		}
	}
		
	check = checkString(lhsFrac,"/",true);
	
	if (check > 0) { // SE CHECK > ZERO ENT�O � UMA FRA��O
	
		switch(lhsFrac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // NEGATIVO
				mathml += '<mo>-</mo>';
				mathml += '<mfrac bevelled="true"><mn>'+lhsFrac.substring(1,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+lhsFrac.substring(check+1, lhsFrac.length)+'</mn></mfrac>'; //DENOMIDADOR
			break;
			default: // POSITIVO
				mathml += '<mfrac bevelled="true"><mn>'+lhsFrac.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+lhsFrac.substring(check+1, lhsFrac.length)+'</mn></mfrac>'; //DENOMIDADOR
		}
	}
	/* ****** */	
	if(style == true){
        mathml += '</mstyle>';
    }
	mathml += '</mfrac></math>';
	return(mathml);
}

function monta_mathml_afr_fourth(){
	/* DECLARACAO DAS VARIAVEIS  */
	var inVar = arguments[0];
	var result = arguments[2];
	var sinal = arguments[1];
  var style = arguments[3];
	var mathml = '<math>';
	var frac = ''; //variavel usada para tranformar o decimal em fracao
	var check=''; // variavel para verificar se frac é uma fracao ou numero inteiro
	/* ***** */
	
  if(style == true){
    mathml += '<mstyle mathcolor="red">';
  }
    
	/* LHS DA FUNCAO */
	mathml += "<msub><mi>"+inVar.charAt(0)+"</mi><mn>"+inVar.charAt(1)+"</mn></msub>";
	if (sinal == 'ge') {
		mathml += "<mo>&ge;</mo>";
	} else if (sinal == 'le') {
		mathml += "<mo>&le;</mo>";
	}
	/* ***** */
	frac = toFrac(roundSigDig(result,15) , 1000, .000000001);
	check = checkString(frac,"/",true);
	if (check > 0) { // SE CHECK > ZERO ENTAO É UMA FRACAO
		
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				mathml += '<mfrac><mn>'+frac.substring(1,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
			break;
			default: // positivo
				mathml += '<mfrac><mn>'+frac.substring(0,check)+'</mn>'; //NUMERADOR
				mathml += '<mn>'+frac.substring(check+1, frac.length)+'</mn></mfrac>'; //DENOMIDADOR
		}
		
	} else { // CHECK < ZERO =  NUMERO INTEIRO 
	
		switch(frac.charAt(0)){ //VERIFICAR O SINAL (POSITIVO OU NEGATIVO)
			case '-':  // negativo
				mathml += '<mo>-</mo>'
				if(frac!=-1){
					mathml += '<mn>'+frac.substring(1,frac.length)+'</mn>';
				}
			break;
			default: // positivo
				mathml += '<mn>'+frac+'</mn>';
		}
	}
	/* ***** */
    if(style == true){
        mathml += '</mstyle>';
    }
	mathml += '</math>';
	return(mathml);
}