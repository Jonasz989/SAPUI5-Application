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

            var oModel = this.getView("detailView").getModel();
            var oEntry = {};
            var that = this;

            oModel.read("/Products",{
                sorters: [new sap.ui.model.Sorter("ID", true)],
                success: function(odata){
                    console.log(odata.results);
                    console.log(odata.results[0].ID);
                    oEntry.ID = odata.results[0].ID + 1;
                    console.log(oEntry.ID);
                    
                    var oCat={
                        "ID": oEntry.ID,
                        "Name": that.getView().byId("prname").getValue(),
                        "Description": that.getView().byId("prdesc").getValue(),
                        "ReleaseDate": that.getView().byId("prreldate").getValue(),
                        "DiscontinuedDate": that.getView().byId("prdiscdate").getValue(),
                        "Rating": that.getView().byId("prrating").getValue(),
                        "Price": that.getView().byId("prprice").getValue(),
                        //"Category/ID": "1",
                        //"Supplier/ID": "1"
                    
                    }

                    //VALIDATION

                    const bad_inputs = [",", ".", "=", "!", "?"];

                    var NameSQLCheck = true;
                    var DescSQLCheck = true;
                    var RatingValueCheck = true;
                    var UltimateCheck = true
                    
                    //
                    for(let i=0; i<bad_inputs.length; i++) {
                        if(oCat.Name.includes(bad_inputs[i])) {
                            NameSQLCheck = false;
                            console.log(NameSQLCheck)
                        }
                    }

                    for(let i=0; i<bad_inputs.length; i++) {
                        if(oCat.Description.includes(bad_inputs[i])) {
                            DescSQLCheck = false;
                            console.log(DescSQLCheck)
                        }
                    }

                    if(oCat.Rating > 5 && oCat.Rating <1){
                        RatingValueCheck = false
                    }
                
                    const ConditionList = [NameSQLCheck, DescSQLCheck, RatingValueCheck]

                    for(let i=0; i<ConditionList.length; i++){
                        if(ConditionList[i] == false){
                            MessageToast.show(i)
                            UltimateCheck = false
                        }
                    }

                    if(UltimateCheck) {
                        oModel.create("/Products", oCat, {
                            success: function () { MessageToast.show("Success!"); 
                        },
                            error: function (oError) { MessageToast.show("Something went wrong :c"); }
                        })
                    }

            }
            });

            history.back();
        }
    });
});