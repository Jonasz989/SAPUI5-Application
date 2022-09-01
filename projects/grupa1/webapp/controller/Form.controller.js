sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Filter",
    "sap/ui/model/Sorter",
    "sap/ui/model/FilterOperator",
    "sap/m/GroupHeaderListItem",
    "sap/ui/Device",
    "sap/ui/core/Fragment",
    "../model/formatter",
    "sap/m/Dialog",
    "sap/m/DialogType",
    "sap/m/Button",
    "sap/m/ButtonType",
    "sap/m/Text",
    "sap/m/MessageToast",
    "sap/m/MessageBox",
    "sap/m/Input"

], function (BaseController, JSONModel, Filter, Sorter, FilterOperator, GroupHeaderListItem, Device, Fragment, formatter, Dialog, DialogType, Button, ButtonType, Text,
    MessageToast, MessageBox, Input) {
    "use strict";

    return BaseController.extend("grupa1.controller.Form", {

        onInit: function () {
            this.getRouter().getTarget("form").attachDisplay(this._onFormDisplayed, this);
        },

        _onFormDisplayed : function () {
            this.getModel("appView").setProperty("/layout", "OneColumn");
        },
        

        onSaveProductClick: function () {
            console.log(this.getView().byId("prprice").getValue());
            var oCat={
                "ID": Math.floor(Math.random()*151)+5,
                "Name": this.getView().byId("prname").getValue(),
                "Description": this.getView().byId("prdesc").getValue(),
                //"ReleaseDate": this.getView().byId("prreldate").getValue(),
                //"DiscontinuedDate": this.getView().byId("prdiscdate").getValue(),
                "Rating": this.getView().byId("prrating").getValue(),
                "Price": this.getView().byId("prprice").getValue(),
                //"Category/ID": "1",
                //"Supplier/ID": "1"
            }
            var oModel = this.getView("detailView").getModel();

            oModel.create("/Products", oCat, {
                success: function () { MessageToast.show("Success!"); },
                error: function (oError) { MessageToast.show("Something went wrong :c"); }
            });

            history.back();
        }
    });
});