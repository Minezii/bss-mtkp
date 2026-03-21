export default function Footer() {
    return (
        <footer className="border-t border-border bg-background mt-auto">
            <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
                <div className="md:flex md:items-center md:justify-between">
                    <div className="flex justify-center space-x-6 md:order-2">
                        <span className="text-muted-foreground text-sm italic">
                            «Студентами для студентов»
                        </span>
                    </div>
                    <div className="mt-8 md:mt-0 md:order-1">
                        <p className="text-center text-base text-muted-foreground">
                            &copy; {new Date().getFullYear()} Большая студенческая система МТКП.
                        </p>
                    </div>
                </div>
            </div>
        </footer>
    );
}
