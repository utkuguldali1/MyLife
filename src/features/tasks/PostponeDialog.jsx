import { useState } from 'react'
import Button from '../../components/ui/Button'
import { Field, Input } from '../../components/ui/Field'
import Modal from '../../components/ui/Modal'

// "Pick a date" pop-up used when postponing a task to a specific day.
export default function PostponeDialog({ open, initialDate, minDate, onSave, onClose }) {
  const [date, setDate] = useState(initialDate)

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Postpone to…"
      size="sm"
      footer={
        <>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            variant="primary"
            disabled={!date}
            onClick={() => {
              onSave(date)
              onClose()
            }}
          >
            Postpone
          </Button>
        </>
      }
    >
      <Field label="New date">
        <Input
          type="date"
          value={date}
          min={minDate}
          onChange={(e) => setDate(e.target.value)}
          data-autofocus
        />
      </Field>
    </Modal>
  )
}
