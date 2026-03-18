import { NgFor, NgIf } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chatbot',
  templateUrl: './chatbot.html',
  imports:[FormsModule,NgFor,NgIf],
  styleUrls: ['./chatbot.css']
})
export class ChatbotComponent {

  isOpen = false;
  userMessage = "";

  messages:any[] = [
    {sender:"Bot", text:"Hello! How can I help you?"}
  ];

  toggleChat(){
    this.isOpen = !this.isOpen;
  }

  sendMessage(){

    if(this.userMessage.trim() == "") return;

    this.messages.push({sender:"You", text:this.userMessage});

    let reply = "Please contact support.";

    if(this.userMessage.toLowerCase().includes("food")){
      reply = "You can book appointment from appointment page.";
    }

    if(this.userMessage.toLowerCase().includes("product")){
      reply = "You can view products in our shop section.";
    }

    this.messages.push({sender:"Bot", text:reply});

    this.userMessage = "";
  }

}