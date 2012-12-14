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
  this.maxLineLength_ = parameters.maxLineLength !==  undefined ? parameters.maxLineLength : false;
  
  if(parameters.text){
    this.setText(parameters.text);
  }
  else{
    this.string_ = "";
    this.text_ = "";
  }
  
  this.rows_ = [];
};


// inheriting Text from GuiObject
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
    
    //to determine text length we want to remove cursor
    //so if text was focused we need to unfocus it and
    // after altering it focus it again
    var wasFocused = false;
    
    if(this.inFocus_){
      this.unfocus();
      wasFocused = true;
    }
    
    //Checking it the string and the text length are below limits
    if((!this.maxLineLength_ && !this.maxLength_)||
      (this.maxLength_ && this.text_.length < this.maxLength_ &&
      this.maxLineLength_ && this.string_.length < this.maxLineLength_))
    {
      this.string_ += letter;
      this.text_ += letter;
      
      console.log(this.text_);
    }
    //if the lines character limit exceeds we need to store the string buffer to rows array
    //and reset it. New line character is stored at the end of the full string.
    else if((this.maxLineLength_ && this.string_.length == this.maxLineLength) &&
      ((this.maxLength_ && this.text_.length < this.maxLength_) ||
      (this.maxLength_ == undefined)))
    {
      this.string_ += '\n';
      this.rows_.push(this.string_);
      this.text_ += letter;
      this.string_ = letter;
      
      
    }
    //if the total maximum size exceeds we don't do anything but focus the text component
    //if it was unfocused.
    if(wasFocused){
      this.focus();
    }
    this.update();
  }
};

WIDGET3D.Text.prototype.erase = function(amount){
  if(this.mutable_){
    var wasFocused = false;
    if(this.inFocus_){
      this.unfocus();
      wasFocused = true;
    }
    
    if(amount >= this.text_.length){
      this.rows_ = [];
      this.text_ = "";
      this.string_ = "";
    }
    else if(amount >= this.string_.length){
    
      if(this.rows_.length != 0){
        var newAmount = amount - this.string_.length;
        this.string_ = this.rows_[this.rows_.length-1];
        this.rows_.splice(-1, 1);
        
        this.string_ = this.string_.substring(0, (this.string_.length-newAmount));
      }
      
    }
    else{
      this.string_ = this.string_.substring(0, (this.string_.length-amount));
    }
    this.text_ = this.text_.substring(0, (this.text_.length-amount));
    
    if(wasFocused){
      this.focus();
    }
    
    this.update();
  }
};

//TODO: FIX FOCUSING
//set focus on textobject
WIDGET3D.Text.prototype.focus = function(){
  if(this.mutable_ && !this.inFocus_){
    //this.text_ += this.cursor_;
  }
  WIDGET3D.Basic.prototype.focus.call(this);
};

//unfocus textobject
WIDGET3D.Text.prototype.unfocus = function(){
  if(this.inFocus_ && this.mutable_){
    //this.text_ = this.text_.substring(0, (this.text_.length_-1));
    console.log(this.text_);
  }
  WIDGET3D.Basic.prototype.unfocus.call(this);
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

