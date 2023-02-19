// if (typeof document !== 'undefined') {
//   var script = document.createElement('script');
//   script.src = 'https://code.jquery.com/jquery-3.6.3.min.js';
//   document.body.appendChild(script);
// } else {
//   console.log("NOOO")
// }  

import { type NextRequest, NextResponse } from 'next/server'
import { initialMessages } from '../../components/Chat'
import { type Message } from '../../components/ChatLine'


// break the app if the API key is missing
if (!process.env.OPENAI_API_KEY) {
  throw new Error('Missing Environment Variable OPENAI_API_KEY')
}

const botName = 'Sir Issac Meowton'
const userName = 'Student' // TODO: move to ENV var
const firstMessge = initialMessages[0].message

// @TODO: unit test this. good case for unit testing
const generatePromptFromMessages = (messages: Message[]) => {
  console.log('== INITIAL messages ==', messages)

  let prompt = ''

  // add first user message to prompt
  prompt += messages[1].message

  // remove first conversaiton (first 2 messages)
  const messagesWithoutFirstConvo = messages.slice(2)
  console.log(' == messagesWithoutFirstConvo', messagesWithoutFirstConvo)

  // early return if no messages
  if (messagesWithoutFirstConvo.length == 0) {
    return prompt
  }

  messagesWithoutFirstConvo.forEach((message: Message) => {
    const name = message.who === 'user' ? userName : botName
    prompt += `\n${name}: ${message.message}`
  })
  return prompt
}

export const config = {
  runtime: 'edge',
}

export default async function handler(req: NextRequest) {
  // read body from request
  const body = await req.json()

  // const messages = req.body.messages
  const messagesPrompt = generatePromptFromMessages(body.messages)
  console.log("MESSAGES:")
  console.log(body.messages)
  //if (body.messages.message[2] !=  null) {console.log("SHOULD BE CHAT: " + body.messages.message[2] + ", END")};
  const defaultPrompt = `I am Friendly AI Assistant. \n\nThis is the conversation between AI Bot and a news reporter.\n\n${botName}: ${firstMessge}\n${userName}: ${messagesPrompt}\n${botName}: `
  const finalPrompt = process.env.AI_PROMPT
    ? `${process.env.AI_PROMPT}${messagesPrompt}\n${botName}: `
    : defaultPrompt

  const payload = {
    model: 'text-davinci-003',
    prompt: finalPrompt,
    temperature: process.env.AI_TEMP ? parseFloat(process.env.AI_TEMP) : 0.7,
    max_tokens: process.env.AI_MAX_TOKENS
      ? parseInt(process.env.AI_MAX_TOKENS)
      : 200,
    top_p: 1,
    frequency_penalty: 0,
    presence_penalty: 0,
    stop: [`${botName}:`, `${userName}:`],
    user: body?.user,
  }

  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  }

  if (process.env.OPENAI_API_ORG) {
    requestHeaders['OpenAI-Organization'] = process.env.OPENAI_API_ORG
  }

  const response = await fetch('https://api.openai.com/v1/completions', {
    headers: requestHeaders,
    method: 'POST',
    body: JSON.stringify(payload),
  })

  const data = await response.json()

  if (data.error) {
    console.error('OpenAI API error: ', data.error)
    return NextResponse.json({
      text: `ERROR with API integration. ${data.error.message}`,
    })
  }

  console.log("NEW RESPONSE:");
  let sentanceParse = data.choices[0].text.replaceAll(' ', '#');
  console.log(sentanceParse)

  //const resource = await fetch('http://localhost:1066/api/sematicsearch/' + sentanceParse);
  const resource = await fetch("http://localhost:1066/api/sematicsearch/Meow!#That's#a#great#question!#Derivation#is#an#important#step#in#calculus,#and#it#involves#taking#the#derivative#of#a#function.#To#do#this,#you'll#need#to#use#the#power#rule,#chain#rule,#and/or#product#rule.#Let#meow#help#you#figure#out#which#one#is#best#for#the#function#you're#looking#at.#Purrhaps#you#can#start#by#showing#me#the#equation#you're#trying#to#work#with?");
  //let resourceJson = resource.json()
  console.log(resource)

  // return response with 200 and stringify json text
  return NextResponse.json({ text: data.choices[0].text })
}
