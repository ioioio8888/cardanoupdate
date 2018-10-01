import { News } from '/imports/api/news/news'
import { Comments } from '/imports/api/comments/comments'
import { updateProfile } from '/imports/api/user/methods'
import { FlowRouter } from 'meteor/kadira:flow-router'

import './viewProfile.html'
import './editProfile.html'
import './userProfile.scss'

Template.viewProfile.onCreated(function(){
  this.autorun(() => {
    this.subscribe('news')
    this.subscribe('users')
    this.subscribe('comments')
  })
})

Template.viewProfile.helpers({
  user(){
    let user = Meteor.users.findOne({
      _id: FlowRouter.getParam('userId')
    })
    if(user){
      return {
      id : user._id,
      name : user.profile.name ? user.profile.name : 'No Name',
      bio : user.profile.bio ? user.profile.bio : '',
      // email : user.emails[0].address,
      // verifiedEmail : user.emails[0].verified,
    }
    }
  },
  newsCount(){
    return News.find({createdBy : FlowRouter.getParam('userId')}).count()
  },
  commentsCount(){
    return Comments.find({createdBy : FlowRouter.getParam('userId')}).count()
  },
  news(){
    let news =  News.find({createdBy : FlowRouter.getParam('userId')})
    return news.map(a => {
      return {
        newsId : a._id,
        headline : a.headline,
        slug : a.slug,
        date : new Date(a.createdAt).toLocaleString(),
      }
    })
  },
  comments() {
    let comments = Comments.find({createdBy: FlowRouter.getParam('userId')})
    return comments.map(a => {
      let post = News.findOne({_id : a.parentId})
      return {
        headline : post.headline,
        slug : post.slug
      }
    })
  },
})

Template.editProfile.onCreated(function(){
  this.autorun(() => {
    this.subscribe('users')
  })
})

Template.editProfile.helpers({
  user(){
    let user = Meteor.users.findOne({_id : Meteor.userId()})
    return {
      name : user.profile.name ? user.profile.name : 'No Name',
      email : user.emails[0].address,
      bio : user.bio ? user.bio : '',
    }
  },
})

Template.editProfile.events({
  'submit #editProfileForm'(event){
    event.preventDefault()
    updateProfile.call({
      uId : Meteor.userId(),
      name : event.target.userName.value,
      email : event.target.userEmail.value,
      bio : event.target.bio.value
    }, (err, res) => {
      if(err){
        console.log(err)
      }
      history.back()
    })
  },
})