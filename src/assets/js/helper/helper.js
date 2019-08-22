/**
 * 画面の操作ヘルパー
 */
var modules = modules || {};

modules.helper = (function () {
  var module = {}

  /**
   * 空白、タグ、改行を除去した文字列を返却
   */
  module.excludeBlank = function(str){
    if(!str || str.length == 0){ return ""; }

    return str.replace(/\s|\n|\t/g, '');
  }

  return module;
}());