import { Layout, Text, Page } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'
import Image from 'next/image'

/*
      <section className="flex flex-col gap-6">
        <Text variant="h1">OpenAI GPT-3 text model usage example</Text>
        <Text className="text-zinc-600">
          In this example, a simple chat bot is implemented using Next.js, API
          Routes, and OpenAI API.
        </Text>
      </section>



      <img src="isaacmeowton.png" alt="Sir Isaac Meowton"></img>
*/
function Home() {
  return (  
    <Page className="flex flex-col gap-12">
      <section>
      <div className="center-div">
        <Text variant="h1"><span id = "calculus">Calculus</span>Cat</Text>
        <Text>Re-learning how we learn math—with cats!</Text>
        <br></br>
      </div>

        <section className="flex flex-col gap-3">
          <div className = 'mathcat-cointainer'>
            <div className="lg:w-2/3 lg:h-2/3 mathcat-chatbox">
              <Chat/>
            </div>
            <div className="lg:w-3/10 mathcat-photo">
              <br></br>
              <Image
                src="/isaacmeowton.png"
                width={500}
                height={500}
              />
              <div class = "descriptionMeowton">I'm Sir Isaac Meowton, creator of calculus and full-time feline. Ask me about calculus!</div>
              <br></br>
            </div>
          </div>
        </section>
      </section>
    </Page>
    

    
  )
}

//Home.Layout = Layout

export default Home
