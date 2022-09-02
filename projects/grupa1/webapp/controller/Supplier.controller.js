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
    var sObjectId;
    var sCatId;
    return BaseController.extend("grupa1.controller.Supplier", {

        onInit: function () {
            var oViewModel = new JSONModel({
                busy : false,
                delay : 0
            });

            this.getRouter().getRoute("supp").attachPatternMatched(this._onObjectMatched, this);

            this.setModel(oViewModel, "supplierView");
        },
        
        _onObjectMatched: function (oEvent) {
            sObjectId = oEvent.getParameter("arguments").objectId;
            this.getModel("appView").setProperty("/layout", "OneColumn");
            this.getModel().metadataLoaded().then( function() {
                this._bindView("/Products("+ sObjectId + ")");
            }.bind(this));
        },
        _bindView: function (sObjectPatch) {
            this.getView().bindElement({
                path : sObjectPatch,
                parameters : {
                    expand : "Supplier"
                }
            });
        },

        onProductUpdateClick: function (oItem) {
            //const cos = oItem.getBindingContext();
            
            this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: "Edit Product",
                content:[
                    new sap.m.Label({text:"Name"}),
                    new sap.m.Input({
                        minLength: 1,
                        maxLength: 20,
                        id: "PName"
                    }),
                    new sap.m.Label({text:"Description"}),
                    new sap.m.Input({
                        minLength: 1,
                        maxLength: 30,
                        id: "PDesc"
                    }),
                    new sap.m.Label({text:"Rating"}),
                    new sap.m.Input({
                        minLength: 1,
                        maxLength: 1,
                        type: "Number",
                        id: "PRating"
                    }),
                    new sap.m.Label({text:"Price"}),
                    new sap.m.Input({
                        minLength: 1,
                        maxLength: 7,
                        type: "Number",
                        id: "PPrice" 
                  })
                ],
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: "Submit",
                    press: function () {

                        var prodname = sap.ui.getCore().byId("PName").getValue();
                        var proddesc = sap.ui.getCore().byId("PDesc").getValue();
                        var prodrating = sap.ui.getCore().byId("PRating").getValue();
                        var prodprice = sap.ui.getCore().byId("PPrice").getValue();

                        const bad_inputs = [",", ".", "=", "!", "?","'",'"',"%",";","*","/", "SELECT", "UPDATE", "DELETE"];
                        var messages = {
                            0: "Invalid input Name!",
                            1: "Invalid input Description!",
                            2: "Invalid input Rating!"
                            }
                        var NameSQLCheck = true;
                        var DescSQLCheck = true;
                        var RatingValueCheck = true;
                        var UltimateCheck = true
                        
                        //
                        for(let i=0; i<bad_inputs.length; i++) {
                            if(prodname.includes(bad_inputs[i])) {
                                NameSQLCheck = false;
                                console.log(NameSQLCheck)
                            }
                        }
    
                        for(let i=0; i<bad_inputs.length; i++) {
                            if(proddesc.includes(bad_inputs[i])) {
                                DescSQLCheck = false;
                                console.log(DescSQLCheck)
                            }
                        }
    
                        if(prodrating > 5 && prodrating <1){
                            RatingValueCheck = false
                        }
                    
                        const ConditionList = [NameSQLCheck, DescSQLCheck, RatingValueCheck]
    
                        for(let i=0; i<ConditionList.length; i++){
                            if(ConditionList[i] == false){
                                MessageToast.show(messages[i])
                                UltimateCheck = false
                            }
                        }
    
                        if(UltimateCheck) {

                            var oCat ={
                                "Name": prodname,
                                "Description": proddesc,
                                "Rating": prodrating,
                                "Price": prodprice
                                }
                            var oModel = this.getView().getModel();
                            //console.log(sObjectId);
                            
    
                            oModel.update("/Products("+sObjectId+")", oCat, {
                                merge: true, /* if set to true: PATCHE/MERGE */
                                success: function () { MessageToast.show("Success!"); },
                                error: function (oError) { MessageToast.show("Something went wrong!"); }
                            });
                        }
                        this.oApproveDialog.destroy();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function() {
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })

            });

            this.oApproveDialog.open();

        },

        onProductDeleteClick: function(){
            var oModel = this.getView().getModel();


            this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: "Confirmation",
                content: new Text({
                    text: "Are you sure?"
                }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: "Yes",
                    press: function () {

                        
                        oModel.remove("/Products("+sObjectId+")/Category", {
                            success: function (data) {
                                MessageBox.success("Category connection is gone!", {
                                    title: "Success"
                                })
                            },
                            error: function (e) {
                                alert("error");
                            }
                        });
                        oModel.remove("/Products("+sObjectId+")", {
                            success: function (data) {
                                MessageBox.success("Item is gone!", {
                                    title: "Success"
                                })
                            },
                            error: function (e) {
                                alert("error");
                            }
                        });

                        

                        this.oApproveDialog.destroy();
                        history.goBack();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function() {
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });

            this.oApproveDialog.open();
            
        }
    })
});