import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardRedirect() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const role = session.user.role;

    switch (role) {
        case 'student':
            redirect("/dashboard/student");
            break;
        case 'admin':
            redirect("/dashboard/admin");
            break;
        case 'hod':
            redirect("/dashboard/hod");
            break;
        case 'principal':
            redirect("/dashboard/hod");
            break;
        default:
            redirect("/");
    }
}
