const questionsChekcer = []

function  SetQuestionsChekcer(){
	for(i=0;i<questions.length;i++){
		temp = questions[i].checker;
		typeAnswer = questions[i].type_answer;
		if(typeAnswer !== 'open'){
			if(typeAnswer == 'one')
				temp = String(temp.split(',')[0]);
			else 
				temp = temp.split(';')[0].split(',').sort();
		}else
			temp = String(temp);
		//console.log('setQuestionsChekcer',i,questions[i].text,temp);
		questionsChekcer.push(temp);
	}	
}
SetQuestionsChekcer()


Vue.config.devtools = true
var app = new Vue({
    el: "#app",
    data: {
        parts: part,
        questions: questions,
        selectPart: '',
        selectSection: '',
        selectSubsection: '',
        selectPower: '',
		numberShow: 3,
		filteredQuestions: null,
		mmaxPower: '',
		minPower: '',
		
		//test result
		answerUser: [],
		typQ:[],//типы вопросов на странице
		answerTrueFalse: [],//показывать рекомендации по вопросу
		testResult: 0, //кол-во попыток
		testOk: 0, //верных ответов
		testError: 0, //ошибочных ответов
		showRecTheme: false, //показывать рекомендации по теме
		findeRecTheme: [], //рекомендации по теме (по текущим вопросам)
		showRecQType: [], //показывать рекомендации по типу вопроса
		recomed: [], //рекомендации по типу вопроса
		textQ:[], //тексты вопросов на странице
		
		
	},
	watch: {
		selectPart: function (newPart, oldPart) {
		  if (newPart == '') {
			  this.selectSection = ''
			  this.selectSubsection = ''
		  }
		},
		selectSection: function (newSection, oldSection) {
			if (newSection == '') {
				this.selectSubsection = ''
			}
		},
	},
    computed: {
		maxPower(){
			var mmax = 1;
			this.questions.forEach(function(element) {
				mmax = Math.max(mmax,element.Complexity);
			});
			return mmax;
		},
		      
	},
	methods: {
		filterQuestions: function () {
			var ok = false;
			var self = this
			var filtered = self.questions
			if (self.selectPart != '') {
				ok = true;
				filtered = filtered.filter(function (quest) {
					return quest.part == self.selectPart.title
				})
			}
			if (self.selectSection != '') {
				ok = true;
				filtered = filtered.filter(function (quest) {
					return quest.sections == self.selectSection.title
				})
			}
			if (self.selectSubsection != '') {
				ok = true;
				filtered = filtered.filter(function (quest) {
					return quest.subsections == self.selectSubsection.title
				})
			}
			if (self.selectPower !=  '') {
				ok = true;
				if (self.selectPower.hasOwnProperty('idComplexity')) {
					filtered = filtered.filter(function (quest) {
						return quest.Complexity == self.selectPower.idComplexity
					})
				}
				else {
					filtered = filtered.filter(function (quest) {
						return quest.Complexity == self.selectPower
					})
				}
			}
			filtered.sort(function (a, b) {
						return Math.random() - 0.5;
			});
			filtered.forEach(function(element) {				
				if(element.type_answer == 'one'){
					if(!Array.isArray(element.checker))
						element.checker = element.checker.split(',')
					element.checker.sort(function (a, b) {
						return Math.random() - 0.5;
					})
				}
				else if (element.type_answer == 'many') {
					if(!Array.isArray(element.checker))
						element.checker = element.checker.replace(';',',').split(',')
					element.checker.sort(function (a, b) {
						return Math.random() - 0.5;
					})
				}						
			});
			if(ok)
				this.filteredQuestions = filtered.slice(0, this.numberShow);
			else this.filteredQuestions = null;
		
			this.ClearResult();
		
		},
		//answer 
		TestResult(){
			this.SetRecQType();
			this.testResult += 1;
			//включить если есть хотябы один неправильный вопрос с темой
			//если нет - выключить
			this.testOk = 0;
			this.testError = 0;	
			countAnswer = this.textQ.length;
			QT = [];
						
			for(i=0; i<countAnswer;i++){				
				indexCheck = this.ReturnIndexQuestion(this.textQ[i]);
				check = questionsChekcer[indexCheck]; 
				//console.log('check',i,check);
				if(Array.isArray(check)){
					error = this.answerUser[i].sort().join(',')!== check.join(',');
					
				}
				else{
					error=check!==this.answerUser[i];
				}
				
				if(error){
					this.testError+=1;
					this.SetAnswerTrueFalse(i,false);
					QT.push(this.typQ[i]);	
				}else{
					this.SetAnswerTrueFalse(i,true);
				}
			}
			this.testOk = countAnswer-this.testError;	
			
			QT = this.Unique(QT);
			for(i=0;i<QT.length;i++){
				this.SetShowRecQType(QT[i], true);
			}
		},	
		ShowRecTheme(){
			this.showRecTheme = !this.showRecTheme;
		},		
		ClearResult(){
			this.answerUser = this.CreateAnswerUser(this.numberShow);			
			this.testResult = 0;
			this.testOk = 0;
			this.testError = 0;
			this.answerTrueFalse = [];
			this.showRecTheme = false;
			this.findeRecTheme = [this.selectPart,this.selectPower];
			
		},
		SetAnswerTrueFalse(index,ok){
			if(this.answerTrueFalse.length<index+1){
				this.answerTrueFalse.splice(index, 0, ok);
			}
			else
				this.answerTrueFalse[index] = ok;
		},
		
		SetRecQType(){
			if(this.selectPart!==''){
				qType = [];
				recomed = [];
				count = 0;
				lvl1=this.selectPart.sections;
				for(v1=0;v1<lvl1.length;v1++){
					qType.push([]);
					lvl2=lvl1[v1].subsections;
				for(v2=0;v2<lvl2.length;v2++){
					qType[v1].push([]);
					lvl3=lvl2[v2].complexity;
				for(v3=0;v3<lvl3.length;v3++){
					qType[v1][v2].push([]);
					lvl4=lvl3[v3].types;
				for(v4=0;v4<lvl4.length;v4++){
					
					qType[v1][v2][v3].push([]); 
					qType[v1][v2][v3][v4].push(lvl4[v4].title);
					qType[v1][v2][v3][v4].push(false);
										
					recomed.push([]);//индекс()
					
					//название типа вопроса
					recomed[count].push([]);
					recomed[count][0].push(lvl4[v4].title);
					
					//расположение вопроса в showRecQType
					recomed[count].push([]);
					recomed[count][1].push(v1, v2, v3, v4);
										
					count++;
					
				}}}}
				this.showRecQType = qType;
				this.recomed = recomed;
			}
		},
		GetColor(index){
			if(0 < this.answerTrueFalse.length){
				if(this.answerTrueFalse[index])
					return '#cdf7bb';
				else
					return '#ffaeae';
			}
			else{
				return 'white';
			}
		},
		ReturnIndexQuestion(text){
			for(j=0;j<questions.length;j++){
				if(questions[j].text==text)
					return j;
			}
		},
		SetShowRecQType(text, val){
			for(i=0;i<this.recomed.length;i++){
				if(this.recomed[i][0] == text){
					v1 = this.recomed[i][1][0];
					v2 = this.recomed[i][1][1];
					v3 = this.recomed[i][1][2];
					v4 = this.recomed[i][1][3];
					this.showRecQType[v1][v2][v3][v4][1]=val;
					return;
				}					
			}
		},
		Unique(arr) {
			var obj = {};

			for (var i = 0; i < arr.length; i++) {
				var str = arr[i];
				obj[str] = true; 
			}
			return Object.keys(obj); 
		},
		CreateAnswerUser(max){
			m =[];
			for(i=0;i<max;i++)
				m.push([]);
			return m;
		},
	}
});