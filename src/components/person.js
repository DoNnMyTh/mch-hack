import React, { Component } from 'react'
import avatar from '../static/avatar.png'
import ScrollBar from 'react-scrollbar'
// import ChatBubble from 'react-chat-bubble'
import { ChatFeed, Message } from 'react-chat-ui'

export default class Person extends Component {

    getMessages(){
        var list = []
        this.props.messages.map((message, i) => {
            list.push(new Message({ id: 0, message: message }))
        })
        return list
    }

    render() {
        return (
            <div >
                <div style = {{height: 10}} />
                <img src = { avatar } height = { 50 } width = { 50 } alt = { "Avatar" } />
                <center>
                    <div 
                        style = {{ width: 300 }}
                    >
                        <ChatFeed
                            messages={ this.getMessages() } // Boolean: list of message objects
                            hasInputField={ false } // Boolean: use our input, or use your own
                            bubblesCentered={ true } //Boolean should the bubbles be centered in the feed?
                            maxHeight = { 200 }
                            style = {{ marginTop: 20 }}
                            // JSON: Custom bubble styles
                            bubbleStyles={
                                {
                                    text: {
                                        fontSize: 30
                                    },
                                    chatbubble: {
                                        borderRadius: 70,
                                        padding: 40
                                    }
                                }
                            }
                        />
                    </div>
                </center>
            </div>
        )
    }
}