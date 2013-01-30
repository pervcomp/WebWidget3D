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
  
  this.mutable_ = parameters.mutable !== undefined ? parameters.mutable : true;
  
  this.cursor_ = parameters.cursor !== undefined ? parameters.cursor : "|";
  
  this.maxLength_ = parameters.maxLength !== undefined ? parameters.maxLength : false;
  this.maxLineLength_ = parameters.maxLineLength !==  undefined ? parameters.maxLineLength : this.maxLength_;
  
  this.endl_ = '\n';
  
  //row buffer that is not yet added to the rows_ table
  this.currentRow_ = "";
  
  //the whole text that is processed in add and erase functions
  this.text_ = "";
  
  //table of rows
  this.rows_ = [];
  
  //the whole text + cursor
  this.textHandle_ = this.text_;
  
  if(parameters.text){
    this.setText(parameters.text);
  }
};


// inheriting Text from Basic
WIDGET3D.Text.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.Text.prototype.type_ = WIDGET3D.ElementType.TEXT;

WIDGET3D.Text.prototype.setText = function(text){
  if(this.mutable_){
    for(var i = 0; i < text.length; ++i){
      this.addLetter(text[i]);
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.addLetter = function(letter){
  if(this.mutable_){
    
    //Checking it the current row and the whole text length are below limits
    if(!this.maxLength_ || this.text_.length < this.maxLength_)
    {
    
      if(!this.maxLineLength_ || this.currentRow_.length < this.maxLineLength_){
        this.currentRow_ += letter;
        this.text_ += letter;
        
        if(this.currentRow_.length == this.maxLineLength_ || this.text_.length == this.maxLength_)
        {
          this.rows_.push(this.currentRow_+this.endl_);
          this.currentRow_ = "";
        }
      }
      else if(this.currentRow_.length == this.maxLineLength_ || this.text_.length == this.maxLength_)
      {
        this.rows_.push(this.currentRow_+this.endl_);
        this.currentRow_ = letter;
        this.text_ += letter;
      }
      
    }
    
    this.textHandle_ = this.text_;
    if(this.inFocus_){
      this.textHandle_ += this.cursor_;
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.erase = function(amount){
  if(this.mutable_){
    
    for(i = 0; i < amount; ++i){
      if(this.currentRow_.length != 0){
        this.currentRow_ = this.currentRow_.substring(0, (this.currentRow_.length-1));
        
        if(this.currentRow_.length == 0 && this.rows_.length != 0){
          this.currentRow_ = this.rows_[this.rows_.length-1];
          this.rows_.splice(-1, 1);
          //taking the endl character out.
          this.currentRow_ = this.currentRow_.substring(0, (this.currentRow_.length-1));
          
        }
      }
      else if(this.rows_.length != 0){
        this.currentRow_ = this.rows_[this.rows_.length-1];
        this.rows_.splice(-1, 1);
        
        //taking the endl character and the character to be erased out.
        this.currentRow_ = this.currentRow_.substring(0, (this.currentRow_.length-2));
      }
    }
    this.text_ = this.text_.substring(0, (this.text_.length-amount));
    
    this.textHandle_ = this.text_;
    if(this.inFocus_){
      this.textHandle_ += this.cursor_;
    }
    
    this.update();
  }
};

//set focus on textobject
WIDGET3D.Text.prototype.focus = function(){
  if(this.mutable_ && !this.inFocus_){
    this.textHandle_ = this.text_ + this.cursor_;
  }
  WIDGET3D.Basic.prototype.focus.call(this);
  this.update();
};

//unfocus textobject
WIDGET3D.Text.prototype.unfocus = function(){
  if(this.inFocus_ && this.mutable_){
    this.textHandle_ = this.text_;
  }
  WIDGET3D.Basic.prototype.unfocus.call(this);
  this.update();
};


//--------------------------------------------------
// PROTOTYPAL INHERITANCE FUNCTION FOR TEXT OBJECT
//--------------------------------------------------
WIDGET3D.Text.prototype.inheritance = function(){
  function guiTextPrototype(){}
  guiTextPrototype.prototype = this;
  var created = new guiTextPrototype();
  return created;
};

