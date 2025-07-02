// app/page.tsx
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import CanvasPreview from "@/components/CanvasPreview"

export default async function Home() {
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session

  return (
    <div className="bg-white text-zinc-900">
      {/* Header */}
      <header>
  <div className="max-w-7xl mx-auto h-16 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
    <div className="text-2xl font-bold">Flow</div>

    <div className="flex items-center space-x-4">
      {!isLoggedIn ? (
        <>
          <Button variant="ghost" className="text-sm" asChild>
            <a href="/signin">Sign in</a>
          </Button>
          <Button className="text-sm px-4 py-2" asChild>
            <a href="/signin">Get started</a>
          </Button>
        </>
      ) : (
        <>
          <Button className="text-sm px-4 py-2" asChild>
            <a href="/dashboard">Go to dashboard</a>
          </Button>
          <Button variant="secondary" className="text-sm px-4 py-2" asChild>
            <a href="/my-videos">My Videos</a>
          </Button>
        </>
      )}
    </div>
  </div>
</header>


      {/* Hero Section */}
      <section className="w-full pt-20 pb-4">
        <div className="max-w-4xl mx-auto px-4 text-center space-y-6">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
            The Fastest Way to Create Math Animations
          </h1>

          <p className="text-lg text-zinc-600">
            Generate stunning 2D animations using simple prompts.{" "}
            Powered by{" "}
            <a
              href="https://github.com/3b1b/manim"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-zinc-900 hover:underline transition"
            >
              Manim
            </a>
          </p>

          <div className="flex justify-center space-x-4 pt-4">
            <Button className="text-sm px-6 py-3" asChild>
              <a href="/signin">Try it now</a>
            </Button>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="text-sm px-6 py-3">
                  Watch demo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-ful">
                <div className="aspect-video w-full">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full object-contain rounded-lg"
                  >
                    <source src="/demo.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </section>

      {/* Visual Preview */}
      <div className="py-16">
        <CanvasPreview />
      </div>

      {/* How It Works Section */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 space-y-12">
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-center">How it works</h2>

          <div className="grid md:grid-cols-3 gap-10 text-center text-zinc-700">
            <div className="space-y-2">
              <div className="text-xl font-semibold">1. Write a Prompt</div>
              <p className="text-sm">
                Describe the animation you want — like “plot a sine wave rotating in 2D”.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xl font-semibold">2. Generate Animation</div>
              <p className="text-sm">
                Flow translates your prompt to Manim code and renders it into a smooth animation.
              </p>
            </div>

            <div className="space-y-2">
              <div className="text-xl font-semibold">3. Download or Embed</div>
              <p className="text-sm">
                Get a shareable video or embed it directly into your site or slides.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Author Section */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-4 text-center space-y-4">
          <h2 className="text-2xl font-semibold">About the Author</h2>
          <p className="text-zinc-600 text-base">
            Hey, I’m Sarthak — an engineer who loves building and solving real problems. 
            This project was inspired by{" "}
            <a
              href="https://www.youtube.com/@3blue1brown"
              target="_blank"
              className="font-medium text-blue-600 hover:underline"
            >
              Grant Sanderson
            </a>{" "}
            and built with Manim to help devs visualize ideas through code.
          </p>
          <a
            href="https://github.com/sarthaksharma27"
            className="inline-block mt-4 text-sm font-medium text-blue-600 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Visit GitHub →
          </a>
        </div>
      </section>
    </div>
  )
}
