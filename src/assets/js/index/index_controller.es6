class IndexController {
  constructor() {
  }
  init() {
    this.initSymbolList();
    this.initRegExpInput();
    this.initResetButton();
    this.initOptionButtons();
  }

  initRegExpInput() {
    function executeReplace() {
      const planeTxt = $('#txt-before').val();
      if(planeTxt.length == 0) {
        return;
      }

      const regExpTxt = $('#reg-exp').val();
      if(regExpTxt.length == 0) {
        return;
      }

      const replaceTxt = $('#replace').val();
      // HACK: 除去したい時もあるので不要？
      // if(replaceTxt.length == 0) {
      //   return;
      // }

      const regExp = new RegExp(regExpTxt, $('#reg-exp-option').val());
      // const regExp = new RegExp(regExpTxt, 'g');
      const replacedTxt = planeTxt.replace(regExp, replaceTxt);
      $('#txt-after').val(replacedTxt);

      if(planeTxt == replacedTxt) {
        toastr["warning"]("変更はありません。");
      }
    }

    $('#txt-before').on('input', function(event) {
      executeReplace();
    });
    $('#reg-exp').on('input', function(event) {
      executeReplace();
    });
    $('#replace').on('input', function(event) {
      executeReplace();
    });
  }

  initSymbolList() {
    $('#symbol-list .label').each(function(index, element){
      $(element).on('click', function(event) {
        const symbol = $(element).text();
        $('#reg-exp').val($('#reg-exp').val() + symbol);
      });
    });
  }

  initOptionButtons() {
    $('#btn-blank-delete').on('click', function(event) {
      $('#reg-exp').val("^$\\n");
      $('#replace').val('');
    });
  }

  initResetButton() {
    $('#btn-reset').on('click', function(event) {
      $('#txt-before').val('');
      $('#txt-after').val('');

      $('#reg-exp').val('');
      $('#replace').val('');
    });
  }
}