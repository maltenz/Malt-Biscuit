import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

import { makeStyles } from '../theme/tss';
import MuiProvider from './MuiProvider';

const useStyles = makeStyles()((theme) => ({
  card: {
    maxWidth: 560,
    padding: theme.spacing(5),
    borderRadius: 20,
    background: theme.palette.background.paper,
    boxShadow: '0 1px 2px rgb(0 0 0 / 0.04), 0 8px 24px rgb(0 0 0 / 0.06)',
  },
}));

interface WelcomeProps {
  title: string;
  description: string;
}

function WelcomeCard({ title, description }: WelcomeProps) {
  const { classes } = useStyles();
  const [clicks, setClicks] = useState(0);

  return (
    <section className={classes.card}>
      <Stack spacing={2}>
        <Typography variant="h3" component="h1" sx={{ fontWeight: 700 }}>
          {title}
        </Typography>
        <Typography color="text.secondary">{description}</Typography>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Button
            variant="contained"
            color="flamingo"
            startIcon={<RocketLaunchIcon />}
            onClick={() => setClicks((n) => n + 1)}
          >
            Hydrated island
          </Button>
          <Typography variant="body2" color="text.secondary">
            {clicks} {clicks === 1 ? 'click' : 'clicks'}
          </Typography>
        </Stack>
        <Typography variant="body2" color="text.secondary">
          Edit this content at <a href="/admin">/admin</a> (run <code>bun run site:tina</code>).
        </Typography>
      </Stack>
    </section>
  );
}

/** Demo island: MUI components + a `tss-react` style, wrapped in the shared provider. */
export default function Welcome(props: WelcomeProps) {
  return (
    <MuiProvider>
      <WelcomeCard {...props} />
    </MuiProvider>
  );
}
