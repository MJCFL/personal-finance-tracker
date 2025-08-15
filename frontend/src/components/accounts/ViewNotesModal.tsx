import React from 'react';
import Modal from '../ui/Modal';

interface ViewNotesModalProps {
  notes: string;
  accountName: string;
  onClose: () => void;
}

const ViewNotesModal: React.FC<ViewNotesModalProps> = ({ notes, accountName, onClose }) => {
  return (
    <Modal title={`Notes for ${accountName}`} onClose={onClose} isOpen={true}>
      <div className="p-4">
        {notes ? (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <p className="whitespace-pre-wrap text-gray-700">{notes}</p>
          </div>
        ) : (
          <p className="text-gray-500 italic">No notes available for this account.</p>
        )}
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ViewNotesModal;
