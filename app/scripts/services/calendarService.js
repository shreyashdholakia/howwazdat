'use strict';

angular.module('angularPassportApp')
.factory('calendarService', function($rootScope) {
	return {
		configureCalUI: function() {
                return {
                    calendar: {
                        height: 610,
                        editable: false,
                        background: '#ffffff',
                        header: {
                            right: 'month,basicWeek',
                            center: 'title',
                            left: 'today prev,next'
                        },
                        eventRender: function (event, element) {
                            addHolidayCSS(event, element);
                            popoverService.showCalendarPopover(event, element);
                            $rootScope.$apply();


                        },
                        eventClick: function (event, jsEvent) {
                            popoverService.setDeleteButtonVisibility(isResourceEventAndUserAssociation(event));
                            var selectedEventJsObj = angular.element(jsEvent.currentTarget);
                            popoverService.clearAllPopovers();
                            if (!lastClicked) {
                                selectedEventJsObj.popover('show');
                            } else if (eventSelect !== event) {
                                $(lastClicked.currentTarget).popover('hide');
                                selectedEventJsObj.popover('show');
                            } else if (eventSelect.title === event.title) {
                                if (!(popoverService.isSamePosition(elementPosition, selectedEventJsObj.position())) && $('.popover').length >= 1) {
                                    $(lastClicked.currentTarget).popover('toggle');
                                    selectedEventJsObj.popover('toggle');
                                } else {
                                    selectedEventJsObj.popover('toggle');
                                }
                            }
                            saveEventUILocations(selectedEventJsObj, jsEvent, event);
                        },
                        viewDisplay: function () {
                            popoverService.clearAllPopovers();
                        },
                        dayClick: function () {
                            popoverService.clearAllPopovers();
                        },
                        eventResizeStart: function () {
                            popoverService.clearAllPopovers();
                        },
                        eventDragStart: function () {
                            popoverService.clearAllPopovers();
                        }

                    }
                };
                }
            }
	});

