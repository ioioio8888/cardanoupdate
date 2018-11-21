import "./warningCard.html";
import "./warningCard.scss";

import { Template } from "meteor/templating";
import {
  deleteWarning,
  proposeNewDataWarning,
  flagWarning
} from "/imports/api/warnings/methods";
import swal from "sweetalert2";
import { notify } from "/imports/modules/notifier";

Template.warningCard.helpers({
  editURL() {
    const warning = Template.currentData().warning;
    if(warning.createdBy === Meteor.userId()){
      return `/scams/${warning._id}/edit`
    }
    return false
  },
  limitChars(val) {
    const limitedText = val && val.length > 50 ? val.slice(0, 50) + " ... " : val;
    const transformer = Template.currentData().textTransformer;
    if (transformer) return transformer(limitedText);
    return limitedText;
  },
  transform(text) {
    const transformer = Template.currentData().textTransformer;
    return transformer ? transformer(text) : text;
  },
});
Template.warningCard.events({
  "click #js-remove": function(event, _) {
    event.preventDefault();

    const warning = Template.currentData().warning;
    swal({
      text: TAPi18n.__('warnings.card.are_you_sure'),
      type: "warning",
      showCancelButton: true
    }).then(confirmed => {
      if (confirmed.value) {
        deleteWarning.call(
          {
            projectId: warning._id
          },
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            }
          }
        );
      }
    });
  },
  "click .flag-warning": function(event, templateInstance) {
    event.preventDefault();
    
    const warning = Template.currentData().warning;
    swal({
      title: TAPi18n.__('warnings.card.flag_reason'),
      input: "text",
      showCancelButton: true,
      inputValidator: value => {
        return !value && TAPi18n.__('warnings.card.invalid_reason');
      }
    }).then(data => {
      if (data.value) {
        flagWarning.call(
          {
            projectId: warning._id,
            reason: data.value
          },
          (err, data) => {
            if (err) {
              notify(err.reason || err.message, "error");
            } else {
              notify(
                TAPi18n.__('warnings.card.success_flag'),
                "success"
              );
            }
          }
        );
      }
    });
  }
});
