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
                "ReleaseDate": document.getElementById("prreldate").value,
                "DiscontinuedDate": document.getElementById("prdiscdate").value,
                "Rating": document.getElementById("prrating").value,
                "Price": document.getElementById("prprice").value,
                "Category/ID": "1",
                "Supplier/ID": "1"
            }
            var oModel = this.getView("detailView").getModel();

            oModel.create("/Categories/1", oCat, {
                success: function () { MessageToast.show("Success!"); },
                error: function (oError) { MessageToast.show("Something went wrong :c"); }
            });

            history.back();
        }
    });
});