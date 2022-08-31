sap.ui.define([
    "./BaseController"
], function (BaseController) {
    "use strict";

    return BaseController.extend("grupa1.controller.Form", {

        onInit: function () {
            this.getRouter().getTarget("notFound").attachDisplay(this._onNotFoundDisplayed, this);
        },

        _onNotFoundDisplayed : function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
        }
    });
});