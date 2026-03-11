import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import ScrollToTop from '@/components/layout/ScrollToTop';
import MobileNavBar from '@/components/layout/MobileNavBar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <ScrollToTop />
            <div className="app-container">
                <Sidebar />
                <main id="main-scroll-container" className="main-content">
                    <Header />
                    <div className="page-container">
                        {children}
                    </div>
                </main>
            </div>
            <MobileNavBar />
        </>
    );
}

