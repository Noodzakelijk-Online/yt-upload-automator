import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const ErrorLogsCard = ({ errorLogs }) => (
  <Card className="mt-6">
    <CardHeader>
      <CardTitle>Error Logs</CardTitle>
      <CardDescription>Detailed error information for debugging</CardDescription>
    </CardHeader>
    <CardContent>
      <ScrollArea className="h-[200px]">
        {errorLogs.map((log, index) => (
          <Alert key={`${log.timestamp}-${index}`} variant="destructive" className="mb-2">
            <AlertTitle>{log.process} Error - {new Date(log.timestamp).toLocaleString()}</AlertTitle>
            <AlertDescription>
              <p><strong>Error:</strong> {log.error}</p>
              <p><strong>Stack Trace:</strong> {log.stack}</p>
            </AlertDescription>
          </Alert>
        ))}
      </ScrollArea>
    </CardContent>
  </Card>
);

export default ErrorLogsCard;