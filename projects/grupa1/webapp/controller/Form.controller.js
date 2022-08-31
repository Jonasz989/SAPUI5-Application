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
        },

        onSaveProductClick: function () {
            var oCat={
                "ID": Math.floor(Math.random()*151)-5,
                "Name": document.getElementById("prname").value,
                "Description": document.getElementById("prdesc").value,
                "Released Date": document.getElementById("prreldate").value,
                "Discontinued Date": document.getElementById("prdiscdate").value,
                "Rating": document.getElementById("prrating").value,
                "Price": document.getElementById("prprice").value,
                "Category": document.getElementById("prcat").value,
                "Supplier": document.getElementById("prsup").value
            }
            var oModel = this.getView().byId("detailView").getModel();

            oModel.create("/Categories/1", oCat, {
                success: function () { MessageToast.show("Success!"); },
                error: function (oError) { MessageToast.show("Something went wrong :c"); }
            });

            history.back();
        }
    });
});