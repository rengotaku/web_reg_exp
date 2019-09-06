class IndexController {
  constructor() {
  }
  init() {
    this.initRegExpInput();
    this.initResetButton();
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
      if(replaceTxt.length == 0) {
        return;
      }

      const regExp = new RegExp(regExpTxt, 'g');
      const replacedTxt = planeTxt.replace(regExp, replaceTxt);
      $('#txt-after').val(replacedTxt);

      if(planeTxt == replacedTxt) {
        toastr["warning"]("変更はありません。");
      }
    }

    $('#reg-exp').on('input', function(event) {
      executeReplace();
    });
    $('#replace').on('input', function(event) {
      executeReplace();
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