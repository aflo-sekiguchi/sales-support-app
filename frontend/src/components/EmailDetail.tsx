import type { EmailDetailProps } from "../types";
import { Badge } from "react-bootstrap";

const EmailDetail: React.FC<EmailDetailProps> = ({ email, onBack, onDownloadFile }) => {
  return (
    <>
      <div>
        <button className="btn btn-secondary mb-2" onClick={onBack}>
          ← 戻る
        </button>
      </div>
      <h5 className="border-bottom pb-1 mb-1">{email.subject || "(件名なし)"}</h5>
      <div className="mb-1">
        <strong>From:</strong> {email.from_address}
        <br />
        <small>{new Date(email.received_at).toLocaleString()}</small>
      </div>
      
      {email.attachments.length > 0 && (
        <div className="mb-2 d-flex flex-wrap gap-2">
          {email.attachments.map((attachment) => (
            <Badge
              key={attachment.id}
              className="badge bg-primary text-light p-1 attachment"
              onClick={() => onDownloadFile(email.uid, attachment)}
            >
              {attachment.file_name}
            </Badge>
          ))}
        </div>
        )
      }
      
      <div className="border p-2 bg-light mail-detail" dangerouslySetInnerHTML={{ __html: email.body ?? "" }}>
        {/* {email.body || "(本文なし)"} */}
      </div>
    </>
  );
};

export default EmailDetail;
