
(function(){
  var steps=[].slice.call(document.querySelectorAll('#mech-steps li'));
  var fig=document.getElementById('f-mech'); var ui=document.querySelector('.stepper');
  if(!steps.length||!fig||!ui)return;
  ui.hidden=false; var i=0; var label=document.getElementById('step-label');
  var marks=[[],[],['s3'],['s3','s4']];
  function show(){
    steps.forEach(function(li,k){li.classList.toggle('on',k===i);});
    fig.classList.add('stepping');
    fig.querySelectorAll('.step').forEach(function(el){
      var on=marks[i].some(function(c){return el.classList.contains(c);}) || i<2;
      el.classList.toggle('on',on);});
    label.textContent='Step '+(i+1)+' of '+steps.length;
    document.getElementById('prev').disabled=i===0; document.getElementById('next').disabled=i===steps.length-1;
  }
  document.getElementById('prev').addEventListener('click',function(){if(i>0){i--;show();}});
  document.getElementById('next').addEventListener('click',function(){if(i<steps.length-1){i++;show();}});
  show();
})();
