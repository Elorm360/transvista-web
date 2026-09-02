import type { TravelRequestRecord } from "@/lib/dashboard/getTravelRequests";

export default function TravelRequestsList({ requests }: { requests: TravelRequestRecord[] }) {
  if (requests.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center">
        <p className="font-semibold text-slate-900">No travel requests yet</p>
        <p className="mt-2 text-sm text-slate-500">New custom-trip and package requests will appear here.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[920px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              {["Reference", "Traveller", "Request", "People", "Status", "Received"].map((label) => (
                <th key={label} className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {requests.map((request) => (
              <tr key={request.id} className="align-top hover:bg-slate-50/70">
                <td className="px-5 py-4 text-sm font-semibold text-blue-700">{request.reference}</td>
                <td className="px-5 py-4">
                  <p className="text-sm font-semibold text-slate-900">{request.fullName}</p>
                  <a className="mt-1 block text-xs text-blue-600 hover:underline" href={`mailto:${request.email}`}>{request.email}</a>
                  <a className="mt-1 block text-xs text-slate-500 hover:underline" href={`tel:${request.phone}`}>{request.phone}</a>
                </td>
                <td className="px-5 py-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{request.kind}</p>
                  <p className="mt-1 max-w-xs text-sm text-slate-700">{request.summary}</p>
                </td>
                <td className="px-5 py-4 text-sm text-slate-700">{request.travellers}</td>
                <td className="px-5 py-4">
                  <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold capitalize text-amber-800">
                    {request.status.replaceAll("-", " ")}
                  </span>
                </td>
                <td className="px-5 py-4 text-sm text-slate-500">
                  {new Date(request.createdAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}