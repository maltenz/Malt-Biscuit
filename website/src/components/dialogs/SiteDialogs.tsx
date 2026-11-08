import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';

import MuiProvider from '../MuiProvider';
import BookingDialog from './BookingDialog';
import ContactDialog, { type ContactDetails } from './ContactDialog';

/**
 * Every site dialog in one island, mounted once per page (BaseLayout.astro):
 * - Booking: opened by `[data-booking]` (Book Now buttons)
 * - Contact: opened by `[data-contact]` (Contact links)
 */
export default function SiteDialogs({ contact }: { contact: ContactDetails }) {
  return (
    <MuiProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <BookingDialog />
        <ContactDialog {...contact} />
      </LocalizationProvider>
    </MuiProvider>
  );
}
