sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("grupa1.controller.Form", {

        onInit: function () {
            this.getRouter().getTarget("form").attachDisplay(this._onFormDisplayed, this);
        },

        _onFormDisplayed : function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
        }
    });
});