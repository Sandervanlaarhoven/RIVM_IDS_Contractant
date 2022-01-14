import React from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  useHistory,
} from "react-router-dom"

import { useRealmApp, RealmAppProvider } from "./RealmApp"

import LogIn from '../utils/LogIn'
import Confirmation from '../utils/Confirmation'
import ResetPassword from '../utils/ResetPassword'
import ResetPasswordConfirm from "../utils/ResetPasswordConfirm"
import Framework from '../Framework'
import RequireRole from '../utils/RequireRole'
import { Role, UserGroup } from '../../types';
import MyFindings from '../MyFindings'
import FindingDetails from '../MyFindings/FindingDetails'
import FindingsOverview from '../FindingsOverview/index';
import FindingDetailsAdmin from '../FindingsOverview/FindingDetails/index';
import Settings from '../Settings'
import InformationPage from '../Information'
import Archive from '../Archive'
import FindingDetailsArchive from '../Archive/FindingDetails'
import SupplierOverview from '../SupplierOverview/index';
import FindingDetailsSupplier from '../SupplierOverview/FindingDetails'
import ChangesOverview from '../ChangesOverview'
import FindingDetailsChanges from '../ChangesOverview/FindingDetails'
import InformationRequestOverview from '../InformationRequestOverview'
import FindingDetailsInformationRequest from '../InformationRequestOverview/FindingDetails'
import { getUsergroupFromUserEmail } from '../utils'

const REALM_APP_ID = "rivm_contractant-feeur"

interface IProps { }

// renders children if there is a logged in user, else renders login component
const RequireLoggedInUser: React.FC<IProps> = ({ children }) => {
  const app: any = useRealmApp()
  return app.currentUser ? <>{children}</> : <LogIn />
}

const RootPage: React.FC<IProps> = () => {
  const app = useRealmApp()
  const history = useHistory()
  const userEmail = app.currentUser?.profile?.email || 'onbekend'
  const userGroup = getUsergroupFromUserEmail(userEmail)
  const isSupplier = userGroup !== UserGroup.rivm && userGroup !== UserGroup.other
  if (isSupplier) history.push('supplieroverview')
  return isSupplier ? <SupplierOverview /> : <MyFindings />
}

const App = () => {
  return (
    <RealmAppProvider appId={REALM_APP_ID}>
      <Router>
        <Switch>
          <Route exact path="/confirmation">
            <Confirmation />
          </Route>
          <Route exact path="/resetpassword/:email">
            <ResetPassword />
          </Route>
          <Route exact path="/resetpassword/">
            <ResetPassword />
          </Route>
          <Route path="/resetpasswordconfirm">
            <ResetPasswordConfirm />
          </Route>
          <Route exact path="/">
            <RequireLoggedInUser>
              <Framework>
                <RootPage />
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/findings">
            <RequireLoggedInUser>
              <Framework>
                <MyFindings />
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/findings/new">
            <RequireLoggedInUser>
              <Framework>
                <FindingDetails />
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/findings/:id">
            <RequireLoggedInUser>
              <Framework>
                <FindingDetails />
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/findingsoverview">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <FindingsOverview />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/findingsoverview/:id">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <FindingDetailsAdmin />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/changesoverview">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <ChangesOverview />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/changesoverview/:id">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <FindingDetailsChanges />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/informationrequestoverview">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <InformationRequestOverview />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/informationrequestoverview/:id">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <FindingDetailsInformationRequest />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/settings">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <Settings />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/information">
            <RequireLoggedInUser>
              <Framework>
                <InformationPage />
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/archive">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <Archive />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/archive/:id">
            <RequireLoggedInUser>
              <Framework>
                <RequireRole role={Role.call_handler}>
                  <FindingDetailsArchive />
                </RequireRole>
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/supplieroverview">
            <RequireLoggedInUser>
              <Framework>
                <SupplierOverview />
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route exact path="/supplieroverview/:id">
            <RequireLoggedInUser>
              <Framework>
                <FindingDetailsSupplier />
              </Framework>
            </RequireLoggedInUser>
          </Route>
          <Route path="/">
            <RequireLoggedInUser>
              <Framework>
                <MyFindings />
              </Framework>
            </RequireLoggedInUser>
          </Route>
        </Switch>
      </Router>
    </RealmAppProvider>
  )
}

export default App
