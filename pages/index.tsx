import { Layout, Text, Page } from '@vercel/examples-ui'
import { Chat } from '../components/Chat'
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
        <section className="flex flex-col gap-3">
        <Text variant="h2">MathCat</Text>
          <div className = 'mathcat-cointainer'>
            <div className="lg:w-2/3 mathcat-chatbox">
              <Chat/>
            </div>
            <div className="lg:w-3/10 mathcat-photo">
              <div>
              
              </div>
              <div>
                
              </div>
            </div>
          </div>
        </section>
      </section>
    </Page>
    

    
  )
}

//Home.Layout = Layout

export default Home
