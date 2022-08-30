sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
], function(BaseController, JSONModel) {
    "use strict";
    
    return BaseController.extend("masterdetail.controller.Supplier", {

        onInit: function () {
            var oViewModel = new JSONModel({
                busy : false,
                delay : 0
            });

            this.getRouter().getRoute("supp").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "supplierView");
        },

        _onObjectMatched: function (oEvent) {
            var sObjectId = oEvent.getParameter("arguments").ObjectId;
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel().metadataLoaded().then( function() {
                this._bindView("/Products("+ sObjectId + ")/Supplier");
            }.bind(this));
        },
        _bindView: function (sObjectPatch) {
            this.getView().bindElement({
                path : sObjectPatch
            });
        }
    })
});