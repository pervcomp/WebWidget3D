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

WIDGET3D.Text = function(){
  
  WIDGET3D.Basic.call( this );
  
  this.mutable_ = true;
  
  this.cursor_ = "|";
  this.string_ = "";
  
  this.text_ = this.string_ + this.cursor_;
  
  this.maxLength_ = undefined;
  
};


// inheriting Text from GuiObject
WIDGET3D.Text.prototype = WIDGET3D.Basic.prototype.inheritance();

WIDGET3D.Text.prototype.type_ = WIDGET3D.ElementType.TEXT;

WIDGET3D.Text.prototype.setText = function(text){
  this.string_ = text;
  if(this.inFocus_ && this.mutable_){
    this.text_ = this.string_ + this.cursor_;
  }
  else{
    this.text_ = this.string_;
  }
  
  this.update();
};

WIDGET3D.Text.prototype.addLetter = function(letter){
  if(this.mutable_){
    if(this.maxLength_ != undefined &&
      this.string_.length < this.maxLength_){

      this.string_ += letter;
    }
    else{
      this.string_ += letter;
    }
    
    if(this.inFocus_){
      this.text_ = this.string_ + this.cursor_;
    }
    else{
      this.text_ = this.string_;
    }
    
    this.update();
  }
};

WIDGET3D.Text.prototype.erase = function(amount){
  if(this.mutable_){
    if(amount >= this.string_.length){
      this.string_ = "";
    }
    else{
      this.string_ = this.string_.substring(0, (this.string_.length-amount));
    }
    
    if(this.inFocus_){
      this.text_ = this.string_ + this.cursor_;
    }
    else{
      this.text_ = this.string_;
    }
    
    this.update();
  }
};

//TODO: FIX FOCUSING
//set focus on textobject
WIDGET3D.Text.prototype.focus = function(){

  WIDGET3D.Basic.prototype.focus.call(this);
  
  if(this.mutable_ && this.inFocus_){
    this.setText(this.string_);
  }
};

//unfocus textobject
WIDGET3D.Text.prototype.unfocus = function(){

  WIDGET3D.Basic.prototype.unfocus.call(this);
  if(this.mutable_ && !this.inFocus_){
    this.setText(this.string_);
  }
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

