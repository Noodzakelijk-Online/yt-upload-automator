import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Index = () => {
  console.log("Index component rendered"); // Add this line for debugging
  return (
    <div className="flex flex-col justify-center items-center min-h-screen">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4">Welcome to YouTube Automation</h1>
        <p className="mb-8">Streamline your YouTube video upload process with our automation tools.</p>
        <Button asChild>
          <Link to="/youtube-automation">Get Started</Link>
        </Button>
      </div>
    </div>
  );
};

export default Index;
