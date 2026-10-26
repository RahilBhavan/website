renderMathInElement(document.querySelector('main'), { delimiters: [
 {left:'$$',right:'$$',display:true}, {left:String.fromCharCode(92)+'(',right:String.fromCharCode(92)+')',display:false},
], throwOnError:false });
