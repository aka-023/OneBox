import Link from "next/link";

export type Email = {
  id: string;
  subject: string;
  snippet: string;
};

interface EmailListProps {
  emails: Email[];
}

export default function EmailList({ emails }: EmailListProps) {
  return (
    <ul className="space-y-4">
      {emails.map((email) => (
        <Link key={email.id} href={`/dashboard/email/${email.id}`}>  
          <li className="bg-white p-4 rounded-lg shadow hover:shadow-md transition cursor-pointer">
            <h3 className="font-semibold text-lg text-gray-800">{email.subject}</h3>
            <p className="text-gray-600 text-sm truncate">{email.snippet}</p>
          </li>
        </Link>
      ))}
    </ul>
  );
}
