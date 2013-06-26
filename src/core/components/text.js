//---------------------------------------------
// GUI OBJECT: TEXT
//---------------------------------------------
//
// This object is designed for text abstraction.
// Abstraction doesn't provide fonts and it's mesh
// can be anything from 3D-text to plane geometry
// textured with 2D-canvas
//

//TODO: REFACTOR SO THAT THE COMPONENT WOULD BE MORE USEFULL OR
// REMOVE AT THE ADAPTER SIDE

WIDGET3D.Text = function(parameters){
  
  WIDGET3D.Basic.call( this );
  
  var parameters = parameters || {};
  
  this.mutable = parameters.mutable !== undefined ? parameters.mutable : true;
  
  this.cursor = parameters.cursor !== undefined ? parameters.cursor : "|";
  
  this.maxLength = parameters.maxLength !== undefined ? parameters.maxLength : false;
  this.maxLineLength = parameters.maxLineLength !==  undefined ? parameters.maxLineLength : this.maxLength;
  
  this.endl = '\n';
  
  //row buffer that is not yet added to the rows table
  this.currentRow = "";
  
  //the whole text that is processed in add and erase functions
  this.text = "";
  
  //table of rows
  this.rows = [];
  
  //the whole text + cursor
  this.textHandle = this.text;
  
  if(parameters.text){
    this.setText(parameters.text);
  }
};


// inheriting Text from Basic
WIDGET3D.Text.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.Text.prototype.type = WIDGET3D.ElementType.TEXT;

WIDGET3D.Text.prototype.setText = function(text){
  if(this.mutable){
    for(var i = 0; i < text.length; ++i){
      this.addLetter(text[i]);
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.addLetter = function(letter){
  if(this.mutable){
    
    //Checking it the current row and the whole text length are below limits
    if(!this.maxLength || this.text.length < this.maxLength)
    {
    
      if(!this.maxLineLength || this.currentRow.length < this.maxLineLength){
        this.currentRow += letter;
        this.text += letter;
        
        if(this.currentRow.length == this.maxLineLength || this.text.length == this.maxLength)
        {
          this.rows.push(this.currentRow+this.endl);
          this.currentRow = "";
        }
      }
      else if(this.currentRow.length == this.maxLineLength || this.text.length == this.maxLength)
      {
        this.rows.push(this.currentRow+this.endl);
        this.currentRow = letter;
        this.text += letter;
      }
      
    }
    
    this.textHandle = this.text;
    if(this.inFocus){
      this.textHandle += this.cursor;
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.erase = function(amount){
  if(this.mutable){
    
    for(i = 0; i < amount; ++i){
      if(this.currentRow.length != 0){
        this.currentRow = this.currentRow.substring(0, (this.currentRow.length-1));
        
        if(this.currentRow.length == 0 && this.rows.length != 0){
          this.currentRow = this.rows[this.rows.length-1];
          this.rows.splice(-1, 1);
          //taking the endl character out.
          this.currentRow = this.currentRow.substring(0, (this.currentRow.length-1));
          
        }
      }
      else if(this.rows.length != 0){
        this.currentRow = this.rows[this.rows.length-1];
        this.rows.splice(-1, 1);
        
        //taking the endl character and the character to be erased out.
        this.currentRow = this.currentRow.substring(0, (this.currentRow.length-2));
      }
    }
    this.text = this.text.substring(0, (this.text.length-amount));
    
    this.textHandle = this.text;
    if(this.inFocus){
      this.textHandle += this.cursor;
    }
    
    this.update();
  }
};

//set focus on textobject
WIDGET3D.Text.prototype.focus = function(){
  if(this.mutable && !this.inFocus){
    this.textHandle = this.text + this.cursor;
  }
  WIDGET3D.Basic.prototype.focus.call(this);
  this.update();
};

//unfocus textobject
WIDGET3D.Text.prototype.unfocus = function(){
  if(this.inFocus && this.mutable){
    this.textHandle = this.text;
  }
  WIDGET3D.Basic.prototype.unfocus.call(this);
  this.update();
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR TEXT OBJECT
//--------------------------------------------------
WIDGET3D.Text.prototype.inheritance = function(){
  function WIDGET3DTextPrototype(){}
  WIDGET3DTextPrototype.prototype = this;
  var created = new WIDGET3DTextPrototype();
  return created;
};

