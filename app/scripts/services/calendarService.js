'use strict';

angular.module('angularPassportApp')
.factory('calendarService', ['$compile',  function($scope, $compile, uiCalendarConfig) {

    function popoverHTMLForEvent(event) {
      var job = event.job, html;

      job = job.replace('.', ' ');
      html = '<div popover-modal=' + event.assignmentId + ' ><p><small><strong>Project Number: </strong>' + event.projectNum + '</small></p>' +
        '<p><small><strong>Project Manager: </strong>' + event.projectManager + '</small></p>' +
//                    '<p><small><strong>Total Effort: </strong>' + event.totalAssignmentEffort + ' hours' + '</small></p>' +
        '<p><small><strong>Job Title: </strong>' + job + '</small></p>';
      if (shouldShowDeleteButton) {
        html = html +
          '<button id="deleteEvent" class="btn btn-primary">Delete</button></div>';
      } else {
        html = html + '</div>';
      }
      return $compile(angular.element(html))($rootScope.$new());
    }

    function titleHTMLForEvent(title) {
      var html = '<p>' + title + '<i class="icon-remove cursor-pointer pull-right" onclick="$(&quot;.popover&quot;).removeClass(&quot;in&quot;).remove();"></i></p>';
      return html;
    }

    function showCalendarPopover(event, element) {
      var msg = new Date(event.start) + ' ' + event.title;
      element.attr({'tooltip': msg,
        'tooltip-append-to-body': true});
      return $compile(element)($scope);

    }

    function configureCalUI() {

      return {
         calendar: {
        height: 450,
          header: {
          left: 'title',
            center: '',
            right: 'today prev,next'
        },
          eventRender: showCalendarPopover
      }
      };
    }


    return {
      setUI: configureCalUI
    };


	}
  ]);

