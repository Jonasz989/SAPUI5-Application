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

    return BaseController.extend("grupa1.controller.List", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the list controller is instantiated. It sets up the event handling for the list/detail communication and other lifecycle tasks.
         * @public
         */
        onInit : function () {
            // Control state model
            var oList = this.byId("list"),
                oViewModel = this._createViewModel(),
                // Put down list's original value for busy indicator delay,
                // so it can be restored later on. Busy handling on the list is
                // taken care of by the list itself.
                iOriginalBusyDelay = oList.getBusyIndicatorDelay();


            this._oGroupFunctions = {
                ID: function(oContext) {
                    var iNumber = oContext.getProperty('ID'),
                        key, text;
                    if (iNumber <= 20) {
                        key = "LE20";
                        text = this.getResourceBundle().getText("listGroup1Header1");
                    } else {
                        key = "GT20";
                        text = this.getResourceBundle().getText("listGroup1Header2");
                    }
                    return {
                        key: key,
                        text: text
                    };
                }.bind(this)
            };

            this._oList = oList;
            // keeps the filter and search state
            this._oListFilterState = {
                aFilter : [],
                aSearch : []
            };

            this.setModel(oViewModel, "listView");
            // Make sure, busy indication is showing immediately so there is no
            // break after the busy indication for loading the view's meta data is
            // ended (see promise 'oWhenMetadataIsLoaded' in AppController)
            oList.attachEventOnce("updateFinished", function(){
                // Restore original busy indicator delay for the list
                oViewModel.setProperty("/delay", iOriginalBusyDelay);
            });

            this.getView().addEventDelegate({
                onBeforeFirstShow: function () {
                    this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
                }.bind(this)
            });

            this.getRouter().getRoute("list").attachPatternMatched(this._onMasterMatched, this);
            this.getRouter().attachBypassed(this.onBypassed, this);
        },

        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */

        /**
         * After list data is available, this handler method updates the
         * list counter
         * @param {sap.ui.base.Event} oEvent the update finished event
         * @public
         */
        onUpdateFinished : function (oEvent) {
            // update the list object counter after new data is loaded
            this._updateListItemCount(oEvent.getParameter("total"));
        },

        /**
         * Event handler for the list search field. Applies current
         * filter value and triggers a new search. If the search field's
         * 'refresh' button has been pressed, no new search is triggered
         * and the list binding is refresh instead.
         * @param {sap.ui.base.Event} oEvent the search event
         * @public
         */
        onSearch: function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
                return;
            }

            var sQuery = oEvent.getParameter("query");

            if (sQuery) {
                this._oListFilterState.aSearch = [new Filter("Name", FilterOperator.Contains, sQuery)];
            } else {
                this._oListFilterState.aSearch = [];
            }
            this._applyFilterSearch();

        },

        /**
         * Event handler for refresh event. Keeps filter, sort
         * and group settings and refreshes the list binding.
         * @public
         */
        onRefresh: function () {
            this._oList.getBinding("items").refresh();
        },

        /**
         * Event handler for the filter, sort and group buttons to open the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the button press event
         * @public
         */
        onOpenViewSettings: function (oEvent) {
            var sDialogTab = "filter";
            if (oEvent.getSource() instanceof sap.m.Button) {
                var sButtonId = oEvent.getSource().getId();
                if (sButtonId.match("sort")) {
                    sDialogTab = "sort";
                } else if (sButtonId.match("group")) {
                    sDialogTab = "group";
                }
            }
            // load asynchronous XML fragment
            if (!this.byId("viewSettingsDialog")) {
                Fragment.load({
                    id: this.getView().getId(),
                    name: "grupa1.view.ViewSettingsDialog",
                    controller: this
                }).then(function(oDialog){
                    // connect dialog to the root view of this component (models, lifecycle)
                    this.getView().addDependent(oDialog);
                    oDialog.addStyleClass(this.getOwnerComponent().getContentDensityClass());
                    oDialog.open(sDialogTab);
                }.bind(this));
            } else {
                this.byId("viewSettingsDialog").open(sDialogTab);
            }
        },

        /*
            Add new category
        */
        onAddCategoryClick: function() { 
            this.oApproveDialog = new Dialog({
                type: DialogType.Message, 
                title: "Create category", 
                content:[
                    new sap.m.Label({text:"Name"}),
                    new sap.m.Input({
                    id: "nameInput",
                    maxLength: 10 
                    })
                ],
                beginButton: new Button({
                type: ButtonType.Emphasized, 
                text: "Submit", 
                press: function () {

                    var oModel = this.getView().getModel();
                    var oEntry = {};
                    var that = this;

                    oModel.read("/Categories",{
                        sorters:  [new sap.ui.model.Sorter("ID",true)],
                        success: function(odata){
                            console.log(odata.results);
                            console.log(odata.results[0].ID);
                            oEntry.ID = odata.results[0].ID + 1;
                            console.log(oEntry.ID);
                            const catName= that.oApproveDialog.getContent()[1].getValue();
                            const isNameFree = !odata.results?.find(cat => cat.Name === catName);
                            const bad_inputs = [",", ".", "=", "!", "?","'",'"',"%",";","*","/", "SELECT", "UPDATE", "DELETE"];
                            var NameSQLCheck = true;

                            if(!catName.length==0){
                                if (isNameFree){
                                    for(let i=0; i<bad_inputs.length; i++) {
                                        if(catName.includes(bad_inputs[i])) {
                                            NameSQLCheck = false;
                                            console.log(NameSQLCheck)
                                        }
                                    }
                                    if(NameSQLCheck) {
                                        var oCat = {
                                        "ID": oEntry.ID,
                                        "Name": catName 
                                    };
                                    oModel.setUseBatch(false);
                                    oModel.create("/Categories", oCat, {
                                        success: function () { MessageToast.show("Success!");  
                                        oModel.setUseBatch(true);
                                            that.oApproveDialog.destroy()},
                                        error: function (oError) { MessageToast.show("Something went wrong!"); }
                                    });                                
                                    }
                                    else{
                                        MessageToast.show("Invalid input Name!")
                                    }
                                } else {
                                    console.log("is not free")
                                    MessageBox.error("Category with that name already exists!", {
                                        title: "Error"
                                    })
                                }
                            }
                            else{
                                console.log("name length 0")
                                MessageBox.error("You must enter name!", {
                                    title: "Error"
                                })
                            }
                        }
                    });
                }.bind(this)
                }), 
                endButton: new Button ({
                    text: "Cancel", 
                    press: function () {
                        this .oApproveDialog.destroy();
                    }.bind(this)
                })
            });
            this .oApproveDialog.open();
        },

        // Po wcisnieciu update
        onUpdateClick: function(oEvent){
            var oModel = this.getView().getModel();

            const clickedItemContext = oEvent.getSource().getBindingContext()
            const clickedItemPath = clickedItemContext.getPath();
            const clickedItemObject = clickedItemContext.getObject();
            const prevName = clickedItemObject.Name;
            const bad_inputs = [",", ".", "=", "!", "?","'",'"',"%",";","*","/", "SELECT", "UPDATE", "DELETE"];
            var NameSQLCheck = true;

            this.oApproveDialog = new Dialog({
                type: DialogType.Message,
                title: "Update",
                content: new Input({
                    id: "nameInput",
                    value: prevName
                }),
                beginButton: new Button({
                    type: ButtonType.Emphasized,
                    text: "Submit",
                    press: function () {
                        const newName = this.oApproveDialog.getContent()[0].getValue()
                        oModel.read("/Categories", {
                            success: function (data) {
                                console.log(data.results)
                                // console.log(!data.results?.find(c => c.Name == newName))
                                const isNameFree = !data.results?.find(cat => cat.Name === newName);

                                if (isNameFree){
                                    for(let i=0; i<bad_inputs.length; i++) {
                                        if(newName.includes(bad_inputs[i])) {
                                            NameSQLCheck = false;
                                            console.log(NameSQLCheck)
                                        }
                                    }
                                    if(NameSQLCheck) {
                                    this._updateConfirmDialog(prevName, newName, clickedItemPath);
                                    } else{
                                        MessageToast.show("Invalid input Name!")
                                    }                              
                                } else {
                                    console.log("is not free")
                                    MessageBox.error("Category with that name already exists!", {
                                        title: "Error"
                                    })
                                }
                                this.oApproveDialog.destroy();
                            }.bind(this),
                            error: function (error) {
                                console.log(error)
                            }
                        });

                    }.bind(this)
                }),
                endButton: new Button({
                    text: "Cancel",
                    press: function () {
                        this.oApproveDialog.destroy();
                    }.bind(this)
                })
            });
            this.oApproveDialog.open();
        },
        // Potwierdzenie update
        _updateConfirmDialog: function(prevName, newName, clickedItemPath){
            var oModel = this.getView().getModel();
            oModel.setUseBatch(false);
            this.oConfirmDialog = new Dialog({
                type: DialogType.Message,
                title: "Confirmation",
                content: new Text({
                    text: "Are you sure you want to rename category from ${prevName} to ${newName}?"
                }),
                beginButton: new Button({
                    type: ButtonType.Accept,
                    text: "Yes",
                    press: function (){                    
                        // console.log(this.oApproveDialog.getContent()[0].getValue())
                        var oCat = {"Name": newName}
                        oModel.update(clickedItemPath, oCat, {
                            merge: true, /* if set to true: PATCHE/MERGE */
                            success: function () { MessageToast.show("Success!"); 
                            oModel.setUseBatch(true);},
                            
                            error: function (oError) { MessageToast.show("Something went wrong!"); }
                        });
                        this.oConfirmDialog.destroy();
                    }.bind(this)
                }),
                endButton: new Button({
                    text: "No",
                    type: ButtonType.Reject,
                    press: function () {
                        this.oConfirmDialog.destroy();
                    }.bind(this)
                })
            });
        this.oConfirmDialog.open();
        },

        //usuwanie kategorii
        
        onDeleteClick: function(oEvent) {
            const clickedItemPath = oEvent.getSource().getBindingContext().getPath()
            var oModel = this.getView().getModel();

            oModel.read("/Products", {
                success: function (data) {
                    var counter=data.results.length
                    console.log(counter);
                    this.oApproveDialog = new Dialog({
                        type: DialogType.Message,
                        title: "Are you want to DESTROY category?",
                        content: new Text({
                            text: "There are "+counter+" products, some might be in this category"
                          }),
                        beginButton: new Button({
                            type: ButtonType.Emphasized,
                            text: "Yes! :)",
                            press: function () {
                                oModel.setUseBatch(false);
                                oModel.remove(clickedItemPath, {
                                    success: function (data) {
                                        MessageBox.success("Category has been deleted!", {
                                            title: "Success"
                                        })
                                        oModel.setUseBatch(true);
                                    },
                                    error: function (e) {
                                        alert("error");
                                    }
                                });
        
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

                }.bind(this),
                error: function (error) {
                    console.log(error)
                }
            });
            
        },

        /**
         * Event handler called when ViewSettingsDialog has been confirmed, i.e.
         * has been closed with 'OK'. In the case, the currently chosen filters, sorters or groupers
         * are applied to the list, which can also mean that they
         * are removed from the list, in case they are
         * removed in the ViewSettingsDialog.
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @public
         */
        onConfirmViewSettingsDialog: function (oEvent) {
            
            var aFilterItems = oEvent.getParameters().filterItems,
                aFilters = [],
                aCaptions = [];

            // update filter state:
            // combine the filter array and the filter string
            aFilterItems.forEach(function (oItem) {
                switch (oItem.getKey()) {
                    case "Filter1" :
                        aFilters.push(new Filter("ID", FilterOperator.LE, 100));
                        break;
                    case "Filter2" :
                        aFilters.push(new Filter("ID", FilterOperator.GT, 100));
                        break;
                    default :
                        break;
                }
                aCaptions.push(oItem.getText());
            });

            this._oListFilterState.aFilter = aFilters;
            this._updateFilterBar(aCaptions.join(", "));
            this._applyFilterSearch();
            this._applySortGroup(oEvent);
        },

        /**
         * Apply the chosen sorter and grouper to the list
         * @param {sap.ui.base.Event} oEvent the confirm event
         * @private
         */
        _applySortGroup: function (oEvent) {
            var mParams = oEvent.getParameters(),
                sPath,
                bDescending,
                aSorters = [];
            
            // apply sorter to binding
            // (grouping comes before sorting)
            if (mParams.groupItem) {
                sPath = mParams.groupItem.getKey();
                bDescending = mParams.groupDescending;
                var vGroup = this._oGroupFunctions[sPath];
                aSorters.push(new Sorter(sPath, bDescending, vGroup));
            }
            
            sPath = mParams.sortItem.getKey();
            bDescending = mParams.sortDescending;
            aSorters.push(new Sorter(sPath, bDescending));
            this._oList.getBinding("items").sort(aSorters);
        },

        /**
         * Event handler for the list selection event
         * @param {sap.ui.base.Event} oEvent the list selectionChange event
         * @public
         */
        onSelectionChange: function (oEvent) {
            var oList = oEvent.getSource(),
                bSelected = oEvent.getParameter("selected");

            // skip navigation when deselecting an item in multi selection mode
            if (!(oList.getMode() === "MultiSelect" && !bSelected)) {
                // get the list item, either from the listItem parameter or from the event's source itself (will depend on the device-dependent mode).
                this._showDetail(oEvent.getParameter("listItem") || oEvent.getSource());
            }
        },

        /**
         * Event handler for the bypassed event, which is fired when no routing pattern matched.
         * If there was an object selected in the list, that selection is removed.
         * @public
         */
        onBypassed: function () {
            this._oList.removeSelections(true);
        },

        /**
         * Used to create GroupHeaders with non-capitalized caption.
         * These headers are inserted into the list to
         * group the list's items.
         * @param {Object} oGroup group whose text is to be displayed
         * @public
         * @returns {sap.m.GroupHeaderListItem} group header with non-capitalized caption.
         */
        createGroupHeader: function (oGroup) {
            return new GroupHeaderListItem({
                title : oGroup.text,
                upperCase : false
            });
        },

        /**
         * Event handler for navigating back.
         * We navigate back in the browser history
         * @public
         */
        onNavBack: function() {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

    


        /* =========================================================== */
        /* begin: internal methods                                     */
        /* =========================================================== */


        _createViewModel: function() {
            return new JSONModel({
                isFilterBarVisible: false,
                filterBarLabel: "",
                delay: 0,
                title: this.getResourceBundle().getText("listTitleCount", [0]),
                noDataText: this.getResourceBundle().getText("listListNoDataText"),
                sortBy: "Name",
                groupBy: "None"
            });
        },

        _onMasterMatched:  function() {
            //Set the layout property of the FCL control to 'OneColumn'
            this.getModel("appView").setProperty("/layout", "OneColumn");
        },

        /**
         * Shows the selected item on the detail page
         * On phones a additional history entry is created
         * @param {sap.m.ObjectListItem} oItem selected Item
         * @private
         */
        _showDetail: function (oItem) {
            var bReplace = !Device.system.phone;
            // set the layout property of FCL control to show two columns
            this.getModel("appView").setProperty("/layout", "TwoColumnsMidExpanded");
            this.getRouter().navTo("object", {
                objectId : oItem.getBindingContext().getProperty("ID")
            }, bReplace);
        },

        /**
         * Sets the item count on the list header
         * @param {integer} iTotalItems the total number of items in the list
         * @private
         */
        _updateListItemCount: function (iTotalItems) {
            var sTitle;
            // only update the counter if the length is final
            if (this._oList.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("listTitleCount", [iTotalItems]);
                this.getModel("listView").setProperty("/title", sTitle);
            }
        },

        /**
         * Internal helper method to apply both filter and search state together on the list binding
         * @private
         */
        _applyFilterSearch: function () {
            var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
                oViewModel = this.getModel("listView");
            this._oList.getBinding("items").filter(aFilters, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aFilters.length !== 0) {
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("listListNoDataWithFilterOrSearchText"));
            } else if (this._oListFilterState.aSearch.length > 0) {
                // only reset the no data text to default when no new search was triggered
                oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("listListNoDataText"));
            }
        },

        /**
         * Internal helper method that sets the filter bar visibility property and the label's caption to be shown
         * @param {string} sFilterBarText the selected filter value
         * @private
         */
        _updateFilterBar : function (sFilterBarText) {
            var oViewModel = this.getModel("listView");
            oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
            oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("listFilterBarText", [sFilterBarText]));
        }

    });

});