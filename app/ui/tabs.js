// app/home/page.js
import Link from 'next/link';
import Button from "@/app/ui/button"; // Pastikan jalur ini benar
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/ui/card";
import { Tabs, TabsContent, TabsTrigger } from "@/app/ui/tabs";

const HomePage = () => {
    const handleClick = () => {
        console.log("Button clicked!");
    };

    return (
        <div>
            <h1>Welcome to the Home Page</h1>
            <Button onClick={handleClick}>Click Me</Button>
            <Button disabled>Disabled Button</Button>

            <Card>
                <CardHeader>
                    Example Card Header
                </CardHeader>
                <CardTitle>
                    Example Card Title
                </CardTitle>
                <CardContent>
                    This is the main content of the card.
                </CardContent>
                <CardDescription>
                    Here you can add a description or additional information.
                </CardDescription>
            </Card>

            <Tabs>
                <TabsTrigger label="Tab 1">
                    <TabsContent>
                        <p>This is the content for Tab 1.</p>
                    </TabsContent>
                </TabsTrigger>
                <TabsTrigger label="Tab 2">
                    <TabsContent>
                        <p>This is the content for Tab 2.</p>
                    </TabsContent>
                </TabsTrigger>
                <TabsTrigger label="Tab 3">
                    <TabsContent>
                        <p>This is the content for Tab 3.</p>
                    </TabsContent>
                </TabsTrigger>
            </Tabs>
        </div>
    );
};

export default HomePage;
