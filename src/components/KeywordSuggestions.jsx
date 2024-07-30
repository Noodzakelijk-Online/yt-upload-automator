import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const KeywordSuggestions = ({ tags, onGenerate }) => {
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Keyword Suggestions</CardTitle>
        <CardDescription>AI-powered keyword suggestions for your video.</CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={onGenerate}>Generate Tags</Button>
        {tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <Badge key={index} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default KeywordSuggestions;
