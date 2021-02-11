import { Desktop } from "@wxcc-desktop/sdk";
import { Service } from "@wxcc-desktop/sdk-types";
const template = document.createElement('template')
template.innerHTML = `
<div>
<fieldset id="userfieldset" class="outline">
    <legend>User</legend>
    <div><b> Agent Name: </b><span id="userId"></span></div>
    <div><b> Team Name: </b><span id="teamName"></div>
    <div><b> Extension: </b><span id="extension"></div>
    <div><b> Current User State: </b><span id="userState"></div>
    <br>
    <div id="goAvailable">
        <button>Change state to Available</button>
    </div>
    <div id="goUnavailable">
        <button>Change state to Unavailable</button>
    </div>
    <br>
    <div id="makeCallButtondiv">
    <b> EntryPoint Id </b>
    <input type="text" id="entryPointId"></input>
    <b> Destination no. </b>
        <input type="text" id="destination"></input>
        <button id ="makeCallButton">Make Call</button>
    </div>
</fieldset>
<br>

<fieldset id="interactionfieldset" class="outline">
    <legend>Interaction</legend>
    <div><b> Interaction Id: </b><span id="interactionId"></div>
    <div><b> Channel Type: </b><span id="interactionType"></div>
    <div><b> DNIS: </b><span id="dnis"></div>
    <div><b> From Address: </b><span id="fromAddress"></div>
    <div><b> To Address: </b><span id="toAddress"></div>
    <div><b> Call State: </b><span id="callState"></div>
    <br>
    <iframe name="bing" id="bing" width="900" height="300" src="https://www.bing.com/"></iframe>
</fieldset>
</div>
`
class LearningSample extends HTMLElement {
  interactionId: any;
  interactionType: any;
  mediaChannel: string;
  dnis: string;
  fromAddress: string;
  toAddress: any;
  mediaType: string;

  
state = {
  defaultAuxCode : '0'
  }
    
    constructor() {
        super();
        
        this.attachShadow({
            mode: 'open'
        })
        this.shadowRoot.appendChild(template.content.cloneNode(true));
        
    }

    connectedCallback() {
        this.init();
        this.subscribeAgentContactDataEvents()
        this.subscribeDialerEvents();

        
 
      }
    
      disconnectedCallback() {
       // alert("bye bye")
      }
    
      async init() {
        await Desktop.config.init();
        console.log('init')
        this.shadowRoot.querySelector('#goAvailable').addEventListener('click', () => this.changeState("Available"))
        this.shadowRoot.querySelector('#goUnavailable').addEventListener('click', () => this.changeState("Idle"))
        this.shadowRoot.querySelector('#makeCallButton').addEventListener('click', () => this.makeCall())
       

        this.shadowRoot.querySelector('#userId').innerHTML = Desktop.agentStateInfo.latestData.agentName
        this.shadowRoot.querySelector('#userState').innerHTML = Desktop.agentStateInfo.latestData.subStatus
        this.shadowRoot.querySelector('#teamName').innerHTML = Desktop.agentStateInfo.latestData.teamName
        this.shadowRoot.querySelector('#extension').innerHTML = Desktop.agentStateInfo.latestData.dn
        const auxCount = Desktop.agentStateInfo.latestData.idleCodes.length
        let i = 0 

        while( i<=auxCount-1)
        {

         if(Desktop.agentStateInfo.latestData.idleCodes[i].isDefault == 'true') 
         {  
          
           this.state.defaultAuxCode = Desktop.agentStateInfo.latestData.idleCodes[i].id
           console.log(" defaultAuxCode is  ",this.state.defaultAuxCode)
           break;

         }
       
          i++ 
        }
      }

      async changeState(s: "Available" | "Idle") {
        console.log('going to state ',s)
        console.log('latestData',Desktop.agentStateInfo.latestData)
        if(s=="Available")
            {
         
                const agentState = await Desktop.agentStateInfo.stateChange({
                    state: s,
                    auxCodeIdArray: "0",
                  });

                  console.log("State Changed", agentState);
                  
                  
            }
            if(s=="Idle")
            {
            console.log(s)
               const agentState = await Desktop.agentStateInfo.stateChange({
                    state: s,
                    auxCodeIdArray : this.state.defaultAuxCode
                  });
                  console.log("State Changed to Idle", Desktop.agentStateInfo.latestData.idleCodes[3].id);
                  console.log(Desktop.agentStateInfo.latestData.idleCodes[3].id)
                 
            }   
            this.shadowRoot.querySelector('#userState').innerHTML = Desktop.agentStateInfo.latestData.subStatus
           
      }

  
        async getAgentInfo() {
            const latestData = Desktop.agentStateInfo.latestData;
            const agentName = Desktop.agentStateInfo.latestData.agentName
            console.log("learning-sample IdleCodes: " , latestData );
          }



          subscribeAgentContactDataEvents() {
            Desktop.agentContact.addEventListener("eAgentContact", (msg: Service.Aqm.Contact.AgentContact) =>
              console.log("AgentContact eAgentContact: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentContactAssigned",
              (msg: Service.Aqm.Contact.AgentContact) => {
                console.log("AgentContact eAgentContactAssigned: ", msg);
               
              }
            );
            Desktop.agentContact.addEventListener(
              "eAgentContactEnded",
              (msg: Service.Aqm.Contact.AgentContact) => {
                console.log("AgentContact eAgentContactEnded: ", msg);

                this.shadowRoot.querySelector('#interactionId').innerHTML = ""
                this.shadowRoot.querySelector('#interactionType').innerHTML = ""
                this.shadowRoot.querySelector('#dnis').innerHTML = ""
                this.shadowRoot.querySelector('#fromAddress').innerHTML = ""
                this.shadowRoot.querySelector('#toAddress').innerHTML = ""
                this.shadowRoot.querySelector('#callState').innerHTML = ""
         
              }
            );
            Desktop.agentContact.addEventListener(
              "eAgentContactWrappedUp",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentContactWrappedUp: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentOfferContact",
              (msg: Service.Aqm.Contact.AgentContact) => {
                console.log("AgentContact eAgentOfferContact: ", msg);
                 this.interactionId = msg.data.interaction.interactionId
                 this.mediaType = msg.data.interaction.mediaType
                 this.dnis =  msg.data.interaction.callProcessingDetails.dnis
                 this.fromAddress = msg.data.interaction.callProcessingDetails.ani
                 this.toAddress = msg.data.interaction.callProcessingDetails.virtualTeamName

                 this.shadowRoot.querySelector('#interactionId').innerHTML = this.interactionId
                 this.shadowRoot.querySelector('#interactionType').innerHTML = this.mediaType
                 this.shadowRoot.querySelector('#dnis').innerHTML = this.dnis
                 this.shadowRoot.querySelector('#fromAddress').innerHTML = this.fromAddress
                 this.shadowRoot.querySelector('#toAddress').innerHTML = this.toAddress
                 this.shadowRoot.querySelector('#callState').innerHTML = "Contact Offered"



              }
            );

            Desktop.agentContact.addEventListener(
              "eAgentOfferContactRona",
              (msg: Service.Aqm.Contact.AgentContact) => {
                console.log("AgentContact eAgentOfferContactRona: ", msg);
                  
                this.shadowRoot.querySelector('#interactionId').innerHTML = ""
                this.shadowRoot.querySelector('#interactionType').innerHTML = ""
                this.shadowRoot.querySelector('#dnis').innerHTML = ""
                this.shadowRoot.querySelector('#fromAddress').innerHTML = ""
                this.shadowRoot.querySelector('#toAddress').innerHTML = ""
                this.shadowRoot.querySelector('#callState').innerHTML = ""
              
              }
            );
            Desktop.agentContact.addEventListener(
              "eAgentOfferConsult",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentOfferConsult: ", msg)
            );
            Desktop.agentContact.addEventListener("eAgentWrapup", (msg: Service.Aqm.Contact.AgentContact) =>
              console.log("AgentContact eAgentWrapup: ", msg)
            );
            Desktop.agentContact.addEventListener("eAgentContactHeld", (msg: Service.Aqm.Contact.AgentContact) =>
              console.log("AgentContact eAgentContactHeld: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentContactUnHeld",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentContactUnHeld: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eCallRecordingStarted",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eCallRecordingStarted: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentConsultCreated",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentConsultCreated: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentConsultConferenced",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentConsultConferenced: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentConsultEnded",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentConsultEnded: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentCtqCancelled",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentCtqCancelled: ", msg)
            );
            Desktop.agentContact.addEventListener("eAgentConsulting", (msg: any) =>
              console.log("AgentContact eAgentConsulting: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentConsultFailed",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentConsultFailed: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentConsultEndFailed",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentConsultEndFailed: ", msg)
            );
            Desktop.agentContact.addEventListener("eAgentCtqFailed", (msg: any) =>
              console.log("AgentContact eAgentCtqFailed: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentCtqCancelFailed",
              (msg: Service.Aqm.Contact.AgentContact) => console.log("AgentContact eAgentCtqCancelFailed: ", msg)
            );
            Desktop.agentContact.addEventListener(
              "eAgentConsultConferenceEndFailed",
              (msg: Service.Aqm.Contact.AgentContact) =>
                console.log("AgentContact eAgentConsultConferenceEndFailed: ", msg)
            );
          }
               

    subscribeDialerEvents() {
            Desktop.dialer.addEventListener("eOutdialFailed", (msg: Service.Aqm.Contact.AgentContact) => console.log(msg));
       }

     makeCall(){
       
      const outdial =  Desktop.dialer.startOutdial({
        data: {
            entryPointId: this.inputEl('entryPointId').value ,
            destination:  this.inputEl('destination').value ,
            direction: "OUTBOUND",
            attributes: {},
            mediaType: "telephoney",
            outboundType: "OUTDIAL"
        }
    });

     }

     private inputEl(name: string): HTMLInputElement {
      return this.shadowRoot!.getElementById(name)! as HTMLInputElement;
    }
    
    
      
}
window.customElements.define('learning-sample', LearningSample);