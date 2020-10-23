'use babel';

import FunctionTreeView from './function-tree-view';
import { CompositeDisposable } from 'atom';

export default {

  functionTreeView: null,
  modalPanel: null,
  subscriptions: null,
  promisedKeyword : ["break","case","catch","continue","debugger","default","delete","do","else","finally","for","function","if","in","instanceof","new","return","switch","this","throw","try","typeof","var","void","while","with","abstract","boolean","byte","char","class","const","double","enum","export","extends","final","float","goto","implements","import","int","interface","long","native","package","private","protected","public","short","static","super","synchronized","throws","transient","volatile","let","yield",],

  activate(state) {
    this.functionTreeView = new FunctionTreeView(state.functionTreeViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.functionTreeView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'function-tree:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.functionTreeView.destroy();
  },

  serialize() {
    return {
      functionTreeViewState: this.functionTreeView.serialize()
    };
  },

  toggle() {
    function IsStringSame(compare, string){
      for(let i=0;i<compare.length;i++){
        if(string == compare[i]){
          return true;
        }
      }
      return false;
    }

    function MoveTargetMethod(button_clicked){
      //console.log("called");
      let position = button_clicked.target.getAttribute("target_line_position") * 1;
      if (editor = atom.workspace.getActiveTextEditor()){
        let pointer = [position * 1, 0];
        editor.setCursorBufferPosition(pointer);
        editor.selectToEndOfLine();
      }
    }

    let editor, parent, target_editor;

    if (editor = atom.workspace.getActiveTextEditor()) {
      let editors = document.getElementsByClassName("editor");
      for(let i=0;i<editors.length;i++){
        if(editors[i].className.indexOf("is-focused") != -1){
          target_editor = editors[i];
          parent = editors[i].getElementsByClassName("tree-function-view");
          break;
        }
      }

      if(parent.length > 0){
        target_editor.removeChild(parent[0]);
      }
      else{
        let target = document.createElement("div");
        target.setAttribute("class", "tree-function-view");
        target.style.cssText = "width:15%; height:100%; white-space: normal; word-wrap:break-word;overflow-y:scroll";
        target_editor.appendChild(target);
        var match;

        let text = editor.getText();
        let regex = /\w+(?=\((\w|,|\s)*?\)\s*?{)\(.*?\)/gs;
        while((match = regex.exec(text)) != null){
          if(!IsStringSame(this.promisedKeyword, match[0].substring(0,match[0].indexOf("(")))){
            let p = document.createElement("p");
            p.style.cssText="margin:0px";
            let button = document.createElement("button");
            let target_index = match.index;
            button.addEventListener("click", MoveTargetMethod);
            button.style.cssText = "color:black; width:100%; font-size:small";
            button.setAttribute("target_line_position", (text.substring(0,match.index).match(/\n/g) || []).length);
            button.textContent = match[0].substring(0,match[0].indexOf("("));
            p.appendChild(button);
            target.appendChild(p);
          }
        }

        /*
        let matches = text.match(/\w+(?=\((\w|,|\s)*?\)\s*?{)\(.*?\)/gs);
        let function_names = [];
        for(let i=0;i<matches.length;i++){
          if(!IsStringSame(["if","while","for","function","switch"], matches[i].substring(0,matches[i].indexOf("(")))){
            function_names.push(matches[i]);
            let p = document.createElement("p");
            p.setAttribute("onclick", )
            p.textContent = matches[i];
            target.appendChild(p);

          }
        }
        */
      }
    }
  }
};
