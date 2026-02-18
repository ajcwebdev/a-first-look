import { Command } from 'commander'

function displayPermissions(data: any) {
  console.log('\nAvailable Permission Groups:')
  console.log('============================\n')
  
  const vectorizeRelated = data.result.filter((perm: any) => 
    perm.name.toLowerCase().includes('vectorize') ||
    perm.name.toLowerCase().includes('worker') ||
    perm.name.toLowerCase().includes('analytics') ||
    perm.name.toLowerCase().includes('ai gateway')
  )
  
  if (vectorizeRelated.length > 0) {
    console.log('Potentially Vectorize-related permissions:')
    vectorizeRelated.forEach((perm: any) => {
      console.log(`\n- ${perm.name}`)
      console.log(`  ID: ${perm.id}`)
      if (perm.scopes && perm.scopes.length > 0) {
        console.log(`  Scopes: ${perm.scopes.join(', ')}`)
      }
    })
    console.log()
  }
  
  console.log('\nAll available permissions:')
  console.log('--------------------------')
  data.result.forEach((perm: any) => {
    console.log(`- ${perm.name} (${perm.id})`)
  })
  
  console.log('\nTotal permission groups:', data.result.length)
}

export const cloudflareCommand = new Command('cloudflare')
  .description('Manage Cloudflare tokens and permissions')

cloudflareCommand
  .command('list-permissions')
  .description('List all available permission groups for your account')
  .action(async () => {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID']
    const email = process.env['CLOUDFLARE_EMAIL']
    const globalKey = process.env['CLOUDFLARE_GLOBAL_API_KEY']
    
    if (!accountId) {
      console.error('Please set CLOUDFLARE_ACCOUNT_ID in your .env file')
      process.exit(1)
    }
    
    let apiToken = process.env['CLOUDFLARE_API_TOKEN']
    let headers: any = {
      'Content-Type': 'application/json'
    }
    
    if (apiToken) {
      headers['Authorization'] = `Bearer ${apiToken}`
    } else if (email && globalKey) {
      headers['X-Auth-Email'] = email
      headers['X-Auth-Key'] = globalKey
    } else {
      console.error('\nTo list permissions, you need either:')
      console.error('1. CLOUDFLARE_API_TOKEN in your .env file, OR')
      console.error('2. Both CLOUDFLARE_EMAIL and CLOUDFLARE_GLOBAL_API_KEY')
      console.error('\nYou can find your global API key at:')
      console.error('https://dash.cloudflare.com/profile/api-tokens')
      console.error('(Look for "Global API Key" and click "View")')
      process.exit(1)
    }
    
    try {
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/permission_groups`,
        { headers }
      )
      
      if (!response.ok) {
        const errorText = await response.text()
        
        if (apiToken && email && globalKey) {
          console.log('Token authorization failed, trying with global API key...')
          
          const retryResponse = await fetch(
            `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/permission_groups`,
            {
              headers: {
                'X-Auth-Email': email,
                'X-Auth-Key': globalKey,
                'Content-Type': 'application/json'
              }
            }
          )
          
          if (retryResponse.ok) {
            const data = await retryResponse.json() as any
            displayPermissions(data)
            return
          }
        }
        
        throw new Error(`Failed to fetch permission groups: ${errorText}`)
      }
      
      const data = await response.json() as any
      displayPermissions(data)
      
    } catch (error) {
      console.error('Error:', error)
      console.error('\nIf you\'re having authorization issues, make sure you have set:')
      console.error('- CLOUDFLARE_EMAIL=your-email@example.com')
      console.error('- CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key')
      process.exit(1)
    }
  })

cloudflareCommand
  .command('create-vectorize-token')
  .description('Create a new API token with Vectorize permissions')
  .option('--name <name>', 'Token name', 'Vectorize API Token')
  .action(async (options) => {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID']
    const email = process.env['CLOUDFLARE_EMAIL']
    const globalKey = process.env['CLOUDFLARE_GLOBAL_API_KEY']
    
    if (!accountId) {
      console.error('Please set CLOUDFLARE_ACCOUNT_ID in your .env file')
      process.exit(1)
    }
    
    if (!email || !globalKey) {
      console.error('\nTo create a new token, you need to use your global API key.')
      console.error('Please add these to your .env file:')
      console.error('CLOUDFLARE_EMAIL=your-email@example.com')
      console.error('CLOUDFLARE_GLOBAL_API_KEY=your-global-api-key')
      console.error('\nYou can find your global API key at:')
      console.error('https://dash.cloudflare.com/profile/api-tokens')
      console.error('(Look for "Global API Key" and click "View")')
      process.exit(1)
    }
    
    console.log('Creating new API token with Vectorize permissions...')
    
    try {
      const permResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/permission_groups`,
        {
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': globalKey,
            'Content-Type': 'application/json'
          }
        }
      )
      
      if (!permResponse.ok) {
        throw new Error(`Failed to fetch permissions: ${await permResponse.text()}`)
      }
      
      const permData = await permResponse.json() as any
      
      console.log('Looking for required permissions...')
      
      const requiredPerms = permData.result.filter((perm: any) => 
        perm.name === 'Vectorize Read' ||
        perm.name === 'Vectorize Write' ||
        perm.name.includes('Workers Scripts') ||
        perm.name.includes('Workers KV Storage') ||
        perm.name.includes('Workers Routes') ||
        perm.name.includes('Account Analytics') ||
        perm.name.includes('Analytics')
      )
      
      if (requiredPerms.length === 0) {
        console.error('Could not find required permissions. Available permissions:')
        permData.result.forEach((perm: any) => {
          console.log(`- ${perm.name} (${perm.id})`)
        })
        process.exit(1)
      }
      
      const hasVectorizePerms = requiredPerms.some((perm: any) => 
        perm.name === 'Vectorize Read' || perm.name === 'Vectorize Write'
      )
      
      if (!hasVectorizePerms) {
        console.error('\n⚠️  WARNING: Vectorize permissions not found in the list!')
        console.error('The token may not work properly for Vectorize operations.')
        console.error('\nExpected permissions:')
        console.error('- Vectorize Read')
        console.error('- Vectorize Write')
      }
      
      console.log('\nFound permissions to include:')
      requiredPerms.forEach((perm: any) => {
        console.log(`- ${perm.name}`)
      })
      
      const tokenBody = {
        name: options.name,
        policies: [
          {
            effect: 'allow',
            permission_groups: requiredPerms.map((perm: any) => ({
              id: perm.id,
              meta: {}
            })),
            resources: {
              [`com.cloudflare.api.account.${accountId}`]: '*'
            }
          }
        ]
      }
      
      const createResponse = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens`,
        {
          method: 'POST',
          headers: {
            'X-Auth-Email': email,
            'X-Auth-Key': globalKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(tokenBody)
        }
      )
      
      if (!createResponse.ok) {
        const errorText = await createResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
          if (errorData.errors?.[0]?.message) {
            throw new Error(`Failed to create token: ${errorData.errors[0].message}`)
          }
        } catch (e) {
          console.log('Failed to parse error response')
        }
        throw new Error(`Failed to create token: ${errorText}`)
      }
      
      const tokenData = await createResponse.json() as any
      
      if (!tokenData.result?.value) {
        console.error('\n⚠️  Token created but value not returned in response.')
        console.error('This might be a Cloudflare API limitation.')
        console.error('\nPlease create the token manually via the dashboard:')
        console.error('1. Go to https://dash.cloudflare.com/profile/api-tokens')
        console.error('2. Click "Create Token"')
        console.error('3. Use "Custom token" template')
        console.error('4. Add the permissions shown above')
        console.error('5. Set Account Resources to your account')
        console.error('6. Create and copy the token')
      } else {
        console.log('\n✅ Token created successfully!')
        console.log('\nIMPORTANT: Save this token value, it will only be shown once:')
        console.log('='.repeat(60))
        console.log(tokenData.result.value)
        console.log('='.repeat(60))
        console.log('\nUpdate your .env file:')
        console.log(`CLOUDFLARE_API_TOKEN=${tokenData.result.value}`)
      }
      
      console.log('\nToken details:')
      console.log(`- Name: ${tokenData.result.name}`)
      console.log(`- ID: ${tokenData.result.id}`)
      console.log(`- Status: ${tokenData.result.status || 'active'}`)
      
    } catch (error) {
      console.error('Error:', error)
      console.error('\nIf automated token creation fails, please create manually:')
      console.error('1. Go to https://dash.cloudflare.com/profile/api-tokens')
      console.error('2. Click "Create Token"')
      console.error('3. Choose "Custom token" template')
      console.error('4. Name it "Vectorize API Token"')
      console.error('5. Add these permissions:')
      console.error('   - Account → Vectorize → Read')
      console.error('   - Account → Vectorize → Write')
      console.error('   - Account → Workers Scripts → Edit')
      console.error('   - Account → Workers KV Storage → Edit')
      console.error('   - Account → Workers Routes → Edit')
      console.error('   - Account → Account Analytics → Read')
      console.error('6. Set Account Resources to: Include → Your Account')
      console.error('7. Create the token and copy it to your .env file')
      process.exit(1)
    }
  })

cloudflareCommand
  .command('test-token')
  .description('Test if your current API token works')
  .action(async () => {
    const accountId = process.env['CLOUDFLARE_ACCOUNT_ID']
    const apiToken = process.env['CLOUDFLARE_API_TOKEN']
    
    if (!accountId || !apiToken) {
      console.error('Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN in your .env file')
      process.exit(1)
    }
    
    try {
      console.log('Testing token validity...')
      const response = await fetch(
        `https://api.cloudflare.com/client/v4/accounts/${accountId}/tokens/verify`,
        {
          headers: {
            'Authorization': `Bearer ${apiToken}`,
            'Content-Type': 'application/json'
          }
        }
      )
      
      const data = await response.json() as any
      
      if (response.ok && data.success) {
        console.log('✅ Token is valid!')
        console.log(`- Token ID: ${data.result.id}`)
        console.log(`- Status: ${data.result.status}`)
        if (data.result.expires_on) {
          console.log(`- Expires: ${data.result.expires_on}`)
        }
        
        console.log('\nTesting Vectorize access...')
        const vectorizeResponse = await fetch(
          `https://api.cloudflare.com/client/v4/accounts/${accountId}/vectorize/v2/indexes`,
          {
            headers: {
              'Authorization': `Bearer ${apiToken}`,
              'Content-Type': 'application/json'
            }
          }
        )
        
        if (vectorizeResponse.ok) {
          console.log('✅ Token has access to Vectorize API!')
        } else if (vectorizeResponse.status === 403) {
          console.error('❌ Token does NOT have access to Vectorize API')
          console.error('Please create a new token with Vectorize permissions')
        } else {
          console.error(`⚠️  Unexpected response from Vectorize API: ${vectorizeResponse.status}`)
        }
      } else {
        console.error('❌ Token is invalid or doesn\'t have proper permissions')
        console.error('Error:', data.errors?.[0]?.message || 'Unknown error')
      }
      
    } catch (error) {
      console.error('Error testing token:', error)
      process.exit(1)
    }
  })