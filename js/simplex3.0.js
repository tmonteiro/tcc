var problema;
var arrayRestricoes = new Array();
var arrayRestricoes = new Array();
var arrayRestricoesAtivas = new Array();


function exemplo() {
	$("#stringPpl").val("Max z = 5x1 + 5x2 + 3x3\nsujeito a\nx1 + 3x2 + x3 <= 3\n-x1 + 3x2<=2\n2x1 - x2 + 2x3 <= 4\n2x1 + 3x2 - x3 <= 2");
}

function resolver() {
	//$("form").hide();
	$("section").show();
	var stringPPL = tratar_string($("#stringPpl").val());
	var cr = unescape( "%0D" );	
	var arrayPPL = extrair_array_elementos(stringPPL,cr);
	
	var funcaoObjetivo = extrair_funcao_objetivo(arrayPPL);
	var restricoes = extrair_restricoes(arrayPPL);  
	
	problema = new Problema();
	problema.setFuncaoObjetivo(funcaoObjetivo);
	problema.setRestricoes(restricoes);
	
	criarPPL(problema);
	
	function criarPPL(problema){
		montaMathML(problema.funcaoObjetivo,"ppl_fo");
		
		var local = "ppl_rest";
		for (var i = 1; i<=restricoes.length; i++){ //MathML Restrições
			$("#ppl > span").show();
			montaMathML(restricoes[i-1], local);
			$("#ppl > #ppl_rest").clone().appendTo("#ppl").attr("id","ppl_rest"+i+"").text("");
			local = "ppl_rest"+i+"";
		}
		$("#ppl > p:last-child").remove();
		
		naoNeg(problema.funcaoObjetivo.funcao.variaveis, "naoNeg");
	}
	
	dicionario = new Dicionario();
	dicionario.setBase(problema.restricoes);
	dicionario.setFuncaoObjetivo(problema.funcaoObjetivo);
	dicionario.setRestricoesNn();
	dicionario.setSolucao();
	dicionario.setMaxZ();
	
	criarMathDic(dicionario, "dic_inicial");	

	console.log('********** DICIONARIO INICIAL **********');
	for (var i = 0; i<dicionario.funcaoFolga.length; i++) {
		console.log(dicionario.funcaoFolga[i].variavel +' = ');
		console.log(dicionario.funcaoFolga[i].funcao.constante);
		console.log(dicionario.funcaoFolga[i].funcao.coeficientes);
		console.log(dicionario.funcaoFolga[i].funcao.variaveis);
		console.log("----------------");
	}
	console.log(dicionario.restricoesNn+ ' > 0');
	console.log("----------------");
	console.log('Z = '+ dicionario.funcaoObjetivo.funcao.coeficientes);
	console.log(dicionario.funcaoObjetivo.funcao.variaveis);
	console.log("----------------");
	console.log('S = '+dicionario.getSolucao());
	console.log('Z = '+dicionario.maxZ);
	console.log('****************************************');
	
	
	var solucao_otima = dicionario.funcaoObjetivo.verificarSolucao();
	var iteracao = 0;
	while (solucao_otima !=1){
		iteracao++;
		
		dicionario.analise_ff(iteracao);
		dicionario.recalculoEquacoes();
		dicionario.setSolucao();
		dicionario.setMaxZ();
		var fracs = [];
		console.log('********** DICIONARIO ' +iteracao+ 'ª ITERACAO **********');
		for (var i = 0; i<dicionario.funcaoFolga.length; i++) {
			//var frac = toFrac (roundSigDig(dicionario.funcaoFolga[i].funcao.coeficientes[0],15) , 1000, .000000001);
			//console.log("FRACAO DO PRIMEIRO COEFICIENTE = "+frac);
			console.log(dicionario.funcaoFolga[i].variavel +' = ' + toFrac (roundSigDig(dicionario.funcaoFolga[i].funcao.constante,15) , 1000, .000000001));
			//console.log(dicionario.funcaoFolga[i].funcao.constante);
			for(var j = 0; j<dicionario.funcaoFolga[i].funcao.coeficientes.length;j++){
				var frac = toFrac (roundSigDig(dicionario.funcaoFolga[i].funcao.coeficientes[j],15) , 1000, .000000001);
				//console.log(frac+" = "+dicionario.funcaoFolga[i].funcao.coeficientes[j]);
				
				fracs[j] = frac;
			}
			console.log(fracs);
			console.log(dicionario.funcaoFolga[i].funcao.variaveis);
			console.log("----------------");
		}
		//MATHML
		criarMathDic(dicionario, iteracao);
		//MATHML
		console.log(dicionario.restricoesNn+ ' > 0');
		console.log("----------------");
		console.log('Z = '+toFrac (roundSigDig(dicionario.funcaoObjetivo.funcao.constante,15) , 1000, .000000001));
		for(var j = 0; j<dicionario.funcaoObjetivo.funcao.coeficientes.length;j++){
				var frac = toFrac (roundSigDig(dicionario.funcaoObjetivo.funcao.coeficientes[j],15) , 1000, .000000001);	
				fracs[j] = frac;
			}
		console.log(fracs);
		console.log(dicionario.funcaoObjetivo.funcao.variaveis);
		console.log("----------------");
		var solucao = dicionario.getSolucao();
		for (var j = 0; j<solucao.length; j++){
			solucao[j] = toFrac(roundSigDig(solucao[j],15) , 1000, .000000001);
		}
		console.log('S = '+solucao);
		console.log('Z = '+toFrac(roundSigDig(dicionario.maxZ,15) , 1000, .000000001));
		console.log('****************************************');
		
		solucao_otima = dicionario.funcaoObjetivo.verificarSolucao();
	}
}

function tratar_string(string) {
	
	string = retira_espacos(string); //Retirar espaços em branco da String

	var cr = unescape( "%0D" );	
	var lf = unescape( "%0A" );
	string = replaceSubstring(string, lf, cr);	// Retira quebra de linha
	
	string = string.toLowerCase();

	//--- Substitui os <= e >= //
	var gteSymbol = unescape("%B3"); // symbols in old netscape
	var lteSymbol = unescape("%B2");
	var lte = unescape ("%u2264");	// actual symbol in IE
	var gte = unescape ("%u2265");

	string = replaceSubstring(string, "<=", lteSymbol);
	string = replaceSubstring(string, ">=", gteSymbol);
	string = replaceSubstring(string, lte, lteSymbol);
	string = replaceSubstring(string, gte, gteSymbol);

	string = replaceSubstring(string, "oa", "oa"+cr);
	string = replaceSubstring(string, ",", cr);
	string = replaceSubstring(string, cr+"sujeito", "sujeito"); 

	var doublecr = true;

	while (doublecr) {
		if (check_string(string,cr+cr,false) == -1) doublecr = false;
		else string = replaceSubstring(string,cr+cr,cr);

	}

	//if (lastChar(string) == cr) string = rightTrim(string,1);
	//----------------------//

	//verifica se existe "max" na estring
	//var check = checkString(string,"max",false);

	return(string);
}

function retira_espacos(inString){
	var outString = "";
	for (var i = 0; i < inString.length; i++) {
		var tempChar = inString.substring(i, i+1);
		if (tempChar!=" ")
			outString = outString+tempChar;
	}
	return (outString);
}

function stripChar (inString,symbol)  {
	outString="";
	for (i=0; i < inString.length; i++)  {
		tempChar=inString.substring (i, i+1);
		if (tempChar!=symbol)
			outString=outString+tempChar;
	}
	return (outString);
}

function replaceSubstring(inString, oldSubstring, newSubstring){
	var outString = "";
	var subLength = oldSubstring.length;
	for (i = 0; i < inString.length; i++){
		var tempStr = inString.substring (i, i+subLength);
		var tempChar = inString.substring (i, i+1);
		if(tempStr!=oldSubstring){
			outString = outString + tempChar;
		}else{
			outString = outString + newSubstring;
			i +=subLength-1;
		}
	}
	return (outString);
}

function check_string(inString,subString,backtrack){

// verifica se a string possui uma determinada subString
// se backtrack = false, retorna -1 não foi encontrada
// se backtrack = true, returns -1 if not found, and right-most location in string if found
// note that location is to the left of the substring in both cases

var found = -1;
//var theString = InString;
var length = inString.length;
var symbLength = subString.length;

	for (var i = length - symbLength; i >-1; i--){	
		var tempChar=inString.substring (i, i+ symbLength);
		if (tempChar == subString){
			found = i;
			if (backtrack) i = -1
		}
	}
	return(found);
}

function isNumber(inString){
	var result = true;
	var length = inString.length;
	if (length == 0) return (false);
	var x = ""
	var y = "1234567890-+*. /"
	var yLength = y.length;
	for (var i = 0; i <= length; i++){ 

		x = inString.charAt(i);
			result = false;
			for (var j = 0; j <= yLength; j++){
				if (x == y.charAt(j)) {result = true; break}
			} 

		if (result == false) return(false);
	} 

	return(result);
}

function extrair_array_elementos(inString, sep) {
	var numSep=0;
	var local = new Array;
	local[0] = -1;
	var length = inString.length;

	//Array 'local' com a posição de separadores na String
	for (var i = 0; i < length; i++) {
		if(inString.charAt(i)==sep)	{
			numSep++;
			local[numSep] = i;
		}
	}

	var outArray = new Array();

	for (var i = 1; i <=numSep; i++){
		outArray[i-1] = inString.substring(local[i-1]+1, local[i]);
	}	
	outArray[numSep] = inString.substring(local[numSep]+1, length);
	
	if(outArray[outArray.length-1] == ''){
		outArray.pop();
	}
	
	return (outArray);
}

function extrair_funcao_objetivo(tempArray){
	var funcao_objetivo = new FuncaoObjetivo();
	
	//RETIRAR AS PALAVRAS SUJEITO A
	var linha1 = tempArray[0];
	var check = check_string(linha1,"s",true); 
	if (check > 0) linha1 = linha1.substring(0,check);

	//RETIRAR A FUNCAO OBJETIVO
	check = check_string(linha1,"=",false);
	
	if (check <= 0) {
		check = check_string(linha1,"max",false);
		if (check >= 0) {
			var tipo = "max"
			linha1 = linha1.substring(check+3, linha1.lenght);
		}
	} else {
		var tipo = linha1.substring(check-1, 0);
		linha1 = linha1.substring(check+1, linha1.lenght);
	}	

	var funcaoObjTemp = parseLinearExpr(linha1);
	
	funcao_objetivo.setTipo(tipo);
	funcao_objetivo.setFuncaoObjetivo(funcaoObjTemp);
	
	return(funcao_objetivo);
}

function extrair_restricoes(tempArray){
	var lteSymbol = unescape("%B2");
	var ineq = "lte";
	var restricoes = new Array;

	for(var i = 1; i <= tempArray.length-1; i++){
	
		var restr = extrair_array_elementos(tempArray[i], lteSymbol);
		var restricao = parseLinearExpr(restr[0]);
		var varlen = restricao.length;
		restricao[varlen] = ineq;
		restricao[varlen+1] = restr[1]; 

		restricoes[i-1] = new Restricao();
		restricoes[i-1].setRestricao(restricao)
	}
	return(restricoes);
}

function parseLinearExpr(inString){
	//inString = stripChar(inString,"(");   // retira parenteses (not needed once x is gone...
	//inString = stripChar(inString,")");

	var stringlen = inString.length;

	if(!isNumber(inString.charAt(0))){
		inString = "1" + inString;
	}

	if (inString.charAt(0) != "-") inString = "+"+ inString;

	inString = replaceSubstring (inString,"+","_+");
	inString = replaceSubstring (inString,"-","_-");

	var ch = "_";
	var arrayElementos = extrair_array_elementos(inString, ch);

	var outArray = new Array();

	for (var i = 1; i <= arrayElementos.length-1; i++) {
		outArray[i-1] = stripChar(arrayElementos[i],"_"); 
	}

	return (outArray);
}

function checkString(inString,subString,backtrack){

// verifica se a string possui uma determinada subString
// se backtrack = false, retorna -1 não foi encontrada
// se backtrack = true, returns -1 if not found, and right-most location in string if found
// note that location is to the left of the substring in both cases

var found = -1;
//var theString = InString;
var length = inString.length;
var symbLength = subString.length;

	for (var i = length - symbLength; i >-1; i--){	
		var tempChar=inString.substring (i, i+ symbLength);
		if (tempChar == subString){
			found = i;
			if (backtrack) i = -1
		}
	}
	return(found);
}

/* ====================================================== */
/* ==== Tranformar numero decimal em Fração ============= */
/* ====================================================== */

function roundSigDig(theNumber, numDigits) {
	
	numDigits = numDigits -1		// too accurate as written

	with (Math) {
		
		if (theNumber == 0) { // SE O NUMERO FOR ZERO CAI FORA
			return(0);
		}
		
		else if(abs(theNumber) < 0.000000000001) { //SE O VALOR ABSOLUTO DO NUMERO FOR MENOS QUE 0.000000000001 CAI FORA
			return(0);
		}

		// WARNING: ignores numbers less than 10^(-12)	

		else { 

			var k = floor(log(abs(theNumber))/log(10))-numDigits
			var k2 = shiftRight( round(shiftRight(abs(theNumber),-k)) , k) //chama 
			
			if (theNumber > 0) {
				return(k2);
			}
			else {
				return(-k2); 
			}
		} // end else

	}
}

function toFrac(x, maxDenom, tol) {

// tolerance is the largest errror you will tolerate before resorting to 
// expressing the result as the input decimal in fraction form
// suggest no less than 10^-10, since we round all to 15 decimal places.

	var theFrac = new Array();

	theFrac[1] = 0;
	theFrac[2] = 0;

	var p1 = 1;
	var p2 = 0;
	var q1 = 0;
	var q2 = 1;	

	var u =0;
	var t = 0;
	
	var flag = true;
	var negflag = false;

	var a = 0;
	var xIn = x; // variable for later

	if (x >10000000000) return(theFrac);

	while (flag){

		if (x < 0) {
			x = -x;
			negflag = true;
			p1 = -p1;
		}

		var intPart = Math.floor(x); // PEGA A PARTE INTEIRA DO NÚMERO
		var decimalPart = roundSigDig((x - intPart),15);  //PEGA A PARTE DECIMAL DO NÚMERO

		x = decimalPart;
		a = intPart;

		t = a*p1 + p2;
		u = a*q1 + q2;

		if  ( (Math.abs(t) > 10000000000 ) || (u > maxDenom ) ) {
			n = p1;
			d = q1;
			break;
		}

		p = t;
		q = u;
				
	//		cout << "cf coeff: " << a << endl; // for debugging
	//		cout << p << "/" << q << endl;	// for debugging

		if ( x == 0 ) {
			n = p;
			d = q;
			break;
		}

		p2 = p1;
		p1 = p;
		q2 = q1;
		q1 = q;
		x = 1/x;

	} // while ( true );

	theFrac[1] = n;
	theFrac[2] = d;

	if (theFrac[2] == 1) {
		return (theFrac[1].toString());
		}
	else {
		return (theFrac[1] + "/" + theFrac[2]);
		}

} // toFrac

function shiftRight(theNumber, k) { //PASSA O NUMERO EX.: 4.5
    
    if (k == 0){
        return (theNumber)
    }
	
    else {
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
    }
    
    else {
        return (theNumber / k2)
    }
}